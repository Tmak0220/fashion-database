import { NextRequest, NextResponse } from "next/server"
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3"
import { createClient } from "@supabase/supabase-js"
import { getR2KeyFromUrl } from "@/lib/r2-keys"
import { isAdminUser } from "@/lib/admin"
import { getRequestUser } from "@/lib/request-auth"

const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const user = await getRequestUser(req)
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = (await req.json().catch(() => null)) as { postId?: unknown } | null
    const postId = body?.postId
    if (typeof postId !== "string" || !postId) {
      return NextResponse.json({ error: "Post ID is required" }, { status: 400 })
    }

    const { data: post, error: postFetchError } = await supabaseAdmin
      .from("posts")
      .select("id, user_id, image_urls")
      .eq("id", postId)
      .single()

    if (postFetchError || !post) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      )
    }

    if (post.user_id !== user.id && !isAdminUser(user)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const imageUrls: string[] = post.image_urls || []

    const { error: tagError } = await supabaseAdmin
      .from("post_tags")
      .delete()
      .eq("post_id", postId)

    if (tagError) {
      throw tagError
    }

    const { error: deletePostError } = await supabaseAdmin
      .from("posts")
      .delete()
      .eq("id", postId)

    if (deletePostError) {
      throw deletePostError
    }

    // Delete the database record first. If that fails, the published post must
    // keep its images instead of becoming a broken post. Storage cleanup is
    // best-effort after the post has been removed successfully.
    for (const imageUrl of imageUrls) {
      try {
        const key = getR2KeyFromUrl(imageUrl)
        await s3.send(new DeleteObjectCommand({ Bucket: process.env.R2_BUCKET_NAME!, Key: key }))
      } catch (error) {
        console.error("Post deleted, but image cleanup failed", error)
      }
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
