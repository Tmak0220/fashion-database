import { NextResponse } from "next/server"
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3"

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
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 })
    }

    const urlObj = new URL(url)
    
    let key = decodeURIComponent(urlObj.pathname.slice(1))

    if (key.includes("?")) {
      key = key.split("?")[0]
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