import { NextResponse } from "next/server"
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3"
import { createClient } from "@/lib/supabase-server"
import { getR2KeyFromUrl, isOwnedAvatarKey, isOwnedTemporaryKey } from "@/lib/r2-keys"

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

    const body = (await request.json().catch(() => null)) as { url?: unknown } | null
    const url = body?.url

    if (typeof url !== "string") {
      return NextResponse.json({ error: "URL is required" }, { status: 400 })
    }

    const key = getR2KeyFromUrl(url)
    if (!isOwnedTemporaryKey(key, user.id) && !isOwnedAvatarKey(key, user.id)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const deleteCommand = new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
    })

    await r2.send(deleteCommand)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("R2 Delete Error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
