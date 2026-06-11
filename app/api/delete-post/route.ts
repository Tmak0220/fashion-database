import { NextRequest, NextResponse } from "next/server"
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3"
import { createClient } from "@supabase/supabase-js"

const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { postId } = await req.json()

    const { data: post, error: postFetchError } = await supabase
      .from("posts")
      .select("*")
      .eq("id", postId)
      .single()

    if (postFetchError || !post) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      )
    }

    const imageUrls: string[] = post.image_urls || []

    for (const imageUrl of imageUrls) {
      let key = ""
      if (imageUrl.includes(".r2.dev/")) {
        key = imageUrl.split(".r2.dev/")[1]
      } else {
        const urlParts = imageUrl.split("/")
        key = urlParts[urlParts.length - 1]
      }

      if (!key) continue

      await s3.send(
        new DeleteObjectCommand({
          Bucket: process.env.R2_BUCKET_NAME!,
          Key: decodeURIComponent(key),
        })
      )
    }

    const { error: tagError } = await supabase
      .from("post_tags")
      .delete()
      .eq("post_id", postId)

    if (tagError) {
      throw tagError
    }

    const { error: deletePostError } = await supabase
      .from("posts")
      .delete()
      .eq("id", postId)

    if (deletePostError) {
      throw deletePostError
    }

    return NextResponse.json({
      success: true,
    })

  } catch (err) {
    console.error("Delete post error:", err)
    return NextResponse.json(
      { error: "Delete failed" },
      { status: 500 }
    )
  }
}