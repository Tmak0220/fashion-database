import { NextRequest, NextResponse } from "next/server"

import {
  S3Client,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3"

import { createClient } from "@supabase/supabase-js"

const s3 = new S3Client({
  region: "auto",

  endpoint: process.env.R2_ENDPOINT,

  credentials: {
    accessKeyId:
      process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey:
      process.env.R2_SECRET_ACCESS_KEY!,
  },
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(
  req: NextRequest
) {

  try {

    const { postId } = await req.json()

    // post取得
    const { data: post, error } =
      await supabase
        .from("posts")
        .select("*")
        .eq("id", postId)
        .single()

    if (error || !post) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      )
    }

    // R2 key 抽出
    const imageUrl =
      post.image_url as string

    const key =
      imageUrl.split(".r2.dev/")[1]

    // R2画像削除
    if (key) {

      await s3.send(
        new DeleteObjectCommand({
          Bucket:
            process.env.R2_BUCKET_NAME!,
          Key: key,
        })
      )
    }

    // tag削除
    await supabase
      .from("post_tags")
      .delete()
      .eq("post_id", postId)

    // post削除
    await supabase
      .from("posts")
      .delete()
      .eq("id", postId)

    return NextResponse.json({
      success: true,
    })

  } catch (err) {

    console.log(err)

    return NextResponse.json(
      { error: "Delete failed" },
      { status: 500 }
    )
  }
}