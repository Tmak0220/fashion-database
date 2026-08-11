import { NextResponse } from "next/server"
import { PutObjectCommand } from "@aws-sdk/client-s3"
import { r2 } from "@/lib/r2"
import { createClient } from "@/lib/supabase-server"
import { checkRateLimit } from "@/lib/rate-limit"
import { getR2PublicUrl } from "@/lib/r2-keys"
import sharp from "sharp"

const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"])

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const rateLimit = checkRateLimit(`upload:${user.id}`, 30, 10 * 60 * 1000)
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many uploads" },
        { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } }
      )
    }

    const formData = await req.formData()
    const file = formData.get("file")
    const purpose = formData.get("purpose") === "avatar" ? "avatar" : "post"

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
    }

    if (!allowedImageTypes.has(file.type)) {
      return NextResponse.json({ error: "Unsupported image format" }, { status: 400 })
    }

    const MAX_FILE_SIZE = 5 * 1024 * 1024
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "ファイルサイズが大きすぎます（5MB以下にしてください）" },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const maxDimension = purpose === "avatar" ? 1200 : 2400
    const buffer = await sharp(Buffer.from(bytes))
      .rotate()
      .resize({
        width: maxDimension,
        height: maxDimension,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 84 })
      .toBuffer()

    const fileName = `${crypto.randomUUID()}.webp`
    const fileKey = purpose === "avatar"
      ? `avatars/${user.id}/${fileName}`
      : `tmp/${user.id}/${fileName}`

    await r2.send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME!,
        Key: fileKey,
        Body: buffer,
        ContentType: "image/webp",
      })
    )

    const imageUrl = `${getR2PublicUrl()}/${fileKey}`

    return NextResponse.json({
      success: true,
      url: imageUrl,
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
