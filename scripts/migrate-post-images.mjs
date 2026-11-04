import { randomUUID } from "node:crypto"
import {
  CopyObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3"
import { createClient } from "@supabase/supabase-js"

const userId = process.argv[2]
const apply = process.argv.includes("--apply")

if (!userId) {
  throw new Error("Usage: node --env-file=.env.local scripts/migrate-post-images.mjs <user-id> [--apply]")
}

const requiredEnvironmentVariables = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "R2_ENDPOINT",
  "R2_ACCESS_KEY_ID",
  "R2_SECRET_ACCESS_KEY",
  "R2_BUCKET_NAME",
]

for (const name of requiredEnvironmentVariables) {
  if (!process.env[name]) throw new Error(`Missing environment variable: ${name}`)
}

const publicUrl = (process.env.R2_PUBLIC_URL || "https://images.fashdb.com").replace(/\/$/, "")
const publicOrigin = new URL(publicUrl).origin
const targetPrefix = `posts/${userId}/`
const bucket = process.env.R2_BUCKET_NAME

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } },
)

const r2 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
})

function getKey(urlValue) {
  const url = new URL(urlValue)
  if (url.origin !== publicOrigin) throw new Error(`Unexpected image host: ${url.origin}`)
  return decodeURIComponent(url.pathname.replace(/^\/+/, ""))
}

function getPublicUrl(key) {
  return `${publicUrl}/${key.split("/").map(encodeURIComponent).join("/")}`
}

async function objectExists(key) {
  try {
    await r2.send(new HeadObjectCommand({ Bucket: bucket, Key: key }))
    return true
  } catch (error) {
    if (error?.$metadata?.httpStatusCode === 404 || error?.name === "NotFound") return false
    throw error
  }
}

function uniqueDestinationKey(sourceKey, reservedKeys) {
  const fileName = sourceKey.split("/").at(-1)
  const dotIndex = fileName.lastIndexOf(".")
  const extension = dotIndex >= 0 ? fileName.slice(dotIndex) : ""
  let destinationKey = `${targetPrefix}${fileName}`

  while (reservedKeys.has(destinationKey)) {
    destinationKey = `${targetPrefix}${randomUUID()}${extension}`
  }

  reservedKeys.add(destinationKey)
  return destinationKey
}

const { data: posts, error: postsError } = await supabase
  .from("posts")
  .select("id, image_urls")
  .eq("user_id", userId)

if (postsError) throw postsError

const sourceKeys = new Set()
for (const post of posts ?? []) {
  for (const url of post.image_urls ?? []) {
    if (typeof url !== "string") continue
    const key = getKey(url)
    if (!key.startsWith(targetPrefix)) sourceKeys.add(key)
  }
}

const reservedKeys = new Set()
const migrationMap = new Map()
for (const sourceKey of sourceKeys) {
  let destinationKey = `${targetPrefix}${sourceKey.split("/").at(-1)}`
  if (reservedKeys.has(destinationKey) || await objectExists(destinationKey)) {
    destinationKey = uniqueDestinationKey(sourceKey, reservedKeys)
  } else {
    reservedKeys.add(destinationKey)
  }
  migrationMap.set(sourceKey, destinationKey)
}

console.log(JSON.stringify({
  mode: apply ? "apply" : "dry-run",
  userId,
  posts: posts?.length ?? 0,
  imagesToMove: migrationMap.size,
  moves: [...migrationMap].map(([from, to]) => ({ from, to })),
}, null, 2))

if (!apply || migrationMap.size === 0) process.exit(0)

for (const [sourceKey, destinationKey] of migrationMap) {
  await r2.send(new CopyObjectCommand({
    Bucket: bucket,
    CopySource: `${bucket}/${sourceKey.split("/").map(encodeURIComponent).join("/")}`,
    Key: destinationKey,
  }))
}

for (const post of posts ?? []) {
  const currentUrls = Array.isArray(post.image_urls) ? post.image_urls : []
  const nextUrls = currentUrls.map((url) => {
    if (typeof url !== "string") return url
    const destinationKey = migrationMap.get(getKey(url))
    return destinationKey ? getPublicUrl(destinationKey) : url
  })

  if (JSON.stringify(currentUrls) === JSON.stringify(nextUrls)) continue

  const { error } = await supabase
    .from("posts")
    .update({ image_urls: nextUrls })
    .eq("id", post.id)
    .eq("user_id", userId)

  if (error) throw error
}

for (const sourceKey of migrationMap.keys()) {
  await r2.send(new DeleteObjectCommand({ Bucket: bucket, Key: sourceKey }))
}

console.log(`Moved ${migrationMap.size} post image(s) into ${targetPrefix}`)
