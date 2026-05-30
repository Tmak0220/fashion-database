import { NextResponse } from "next/server"

import { createClient } from "@supabase/supabase-js"

import {
  DeleteObjectCommand,
} from "@aws-sdk/client-s3"

import { r2 } from "@/lib/r2"

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {

  try {

    const { userId } = await req.json()

    if (!userId) {

      return NextResponse.json(
        { error: "No userId" },
        { status: 400 }
      )
    }

    // 投稿取得

    const { data: posts } =
      await admin
        .from("posts")
        .select("id,image_urls")
        .eq("user_id", userId)

    // R2画像削除

    if (posts) {

      for (const post of posts) {

        const urls =
          post.image_urls || []

        for (const url of urls) {

          try {

            const key =
              url.split("/").pop()

            if (!key) continue

            await r2.send(
              new DeleteObjectCommand({
                Bucket:
                  process.env.R2_BUCKET_NAME!,
                Key: key,
              })
            )

          } catch (e) {

            console.error(
              "R2 delete failed",
              e
            )
          }
        }
      }
    }

    // post_tags

    if (posts?.length) {

      const postIds =
        posts.map((p) => p.id)

      await admin
        .from("post_tags")
        .delete()
        .in("post_id", postIds)
    }

    // posts

    await admin
      .from("posts")
      .delete()
      .eq("user_id", userId)

    // bookmarks

    await admin
      .from("bookmarks")
      .delete()
      .eq("user_id", userId)

    // follows

    await admin
      .from("follows")
      .delete()
      .eq("follower_id", userId)

    await admin
      .from("follows")
      .delete()
      .eq("following_id", userId)

    // brand follows

    await admin
      .from("brand_follows")
      .delete()
      .eq("user_id", userId)

    // designer follows

    await admin
      .from("designer_follows")
      .delete()
      .eq("user_id", userId)

    // users

    await admin
      .from("users")
      .delete()
      .eq("id", userId)

    // auth.users

    await admin.auth.admin.deleteUser(
      userId
    )

    return NextResponse.json({
      success: true,
    })

  } catch (error) {

    console.error(error)

    return NextResponse.json(
      {
        error: "Delete failed",
      },
      {
        status: 500,
      }
    )
  }
}