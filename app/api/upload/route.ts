import { NextResponse } from "next/server"
import { PutObjectCommand } from "@aws-sdk/client-s3"
import { r2 } from "@/lib/r2"
import { checkRateLimit } from "@/lib/rate-limit"
import { getR2PublicUrl } from "@/lib/r2-keys"
import { getRequestUser } from "@/lib/request-auth"

const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"])

export const runtime = "nodejs"

export async function POST(req: Request) {
  try {
    const user = await getRequestUser(req)
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

    const bytes = Buffer.from(await file.arrayBuffer())
    let buffer: Uint8Array = bytes
    let contentType = file.type
    let extension = file.type === "image/jpeg" ? "jpg" : file.type.split("/")[1]

    try {
      const { default: sharp } = await import("sharp")
      const maxDimension = purpose === "avatar" ? 1200 : 2400
      buffer = await sharp(bytes)
        .rotate()
        .resize({
          width: maxDimension,
          height: maxDimension,
          fit: "inside",
          withoutEnlargement: true,
        })
        .webp({ quality: 84 })
        .toBuffer()
      contentType = "image/webp"
      extension = "webp"
    } catch (error) {
      // The browser already compresses uploads before sending them. Keeping
      // that validated image allows uploads to continue if the optional
      // native image transformer is unavailable in the server runtime.
      console.warn("Server image conversion unavailable; storing validated source image", error)
    }

    const fileName = `${crypto.randomUUID()}.${extension}`
    const fileKey = purpose === "avatar"
      ? `avatars/${user.id}/${fileName}`
      : `tmp/${user.id}/${fileName}`

    await r2.send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME!,
        Key: fileKey,
        Body: buffer,
        ContentType: contentType,
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
