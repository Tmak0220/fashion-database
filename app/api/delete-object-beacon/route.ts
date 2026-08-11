import { NextResponse } from "next/server"
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3"
import { createClient } from "@/lib/supabase-server"
import { getR2KeyFromUrl, isOwnedTemporaryKey } from "@/lib/r2-keys"

const r2 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = (await request.json().catch(() => null)) as { urls?: unknown } | null
    const urls = body?.urls

    if (!Array.isArray(urls) || urls.length > 20 || urls.some((url) => typeof url !== "string")) {
      return NextResponse.json({ error: "URLs array is required" }, { status: 400 })
    }

    for (const url of urls) {
      try {
        const key = getR2KeyFromUrl(url)
        if (!isOwnedTemporaryKey(key, user.id)) continue

        const deleteCommand = new DeleteObjectCommand({
          Bucket: process.env.R2_BUCKET_NAME,
          Key: key,
        })

        await r2.send(deleteCommand)
      } catch (err) {
        console.error(`Failed to delete individual file: ${url}`, err)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("R2 Batch Delete Error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
