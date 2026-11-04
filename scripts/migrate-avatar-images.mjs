import { randomUUID } from "node:crypto"
import {
  CopyObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  S3Client,
} from "@aws-sdk/client-s3"
import { createClient } from "@supabase/supabase-js"

const userId = process.argv[2]
const apply = process.argv.includes("--apply")

if (!userId) {
  throw new Error("Usage: node --env-file=.env.local scripts/migrate-avatar-images.mjs <user-id> [--apply]")
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
const targetPrefix = `avatars/${userId}/`
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

const rootObjects = []
let continuationToken
do {
  const page = await r2.send(new ListObjectsV2Command({
    Bucket: bucket,
    ContinuationToken: continuationToken,
  }))
  rootObjects.push(...(page.Contents ?? []).filter((item) => item.Key && !item.Key.includes("/")))
  continuationToken = page.IsTruncated ? page.NextContinuationToken : undefined
} while (continuationToken)

const { data: profile, error: profileError } = await supabase
  .from("profiles")
  .select("id, avatar_url")
  .eq("id", userId)
  .single()

if (profileError) throw profileError

const reservedKeys = new Set()
const migrationMap = new Map()
for (const object of rootObjects) {
  const sourceKey = object.Key
  let destinationKey = `${targetPrefix}${sourceKey}`
  if (reservedKeys.has(destinationKey) || await objectExists(destinationKey)) {
    const dotIndex = sourceKey.lastIndexOf(".")
    const extension = dotIndex >= 0 ? sourceKey.slice(dotIndex) : ""
    destinationKey = `${targetPrefix}${randomUUID()}${extension}`
  }
  reservedKeys.add(destinationKey)
  migrationMap.set(sourceKey, destinationKey)
}

const currentAvatarKey = profile.avatar_url ? getKey(profile.avatar_url) : null
const currentAvatarDestination = currentAvatarKey ? migrationMap.get(currentAvatarKey) : null

console.log(JSON.stringify({
  mode: apply ? "apply" : "dry-run",
  userId,
  rootImagesToMove: migrationMap.size,
  currentAvatarWillBeUpdated: Boolean(currentAvatarDestination),
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

if (currentAvatarDestination) {
  const { error } = await supabase
    .from("profiles")
    .update({ avatar_url: getPublicUrl(currentAvatarDestination) })
    .eq("id", userId)

  if (error) throw error
}

for (const sourceKey of migrationMap.keys()) {
  await r2.send(new DeleteObjectCommand({ Bucket: bucket, Key: sourceKey }))
}

console.log(`Moved ${migrationMap.size} avatar image(s) into ${targetPrefix}`)
