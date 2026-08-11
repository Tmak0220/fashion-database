import { NextRequest, NextResponse } from "next/server"
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3"
import { createClient } from "@supabase/supabase-js"
import { createClient as createServerClient } from "@/lib/supabase-server"
import { getR2KeyFromUrl } from "@/lib/r2-keys"
import { isAdminUser } from "@/lib/admin"

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
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
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

    for (const imageUrl of imageUrls) {
      try {
        const key = getR2KeyFromUrl(imageUrl)
        await s3.send(new DeleteObjectCommand({ Bucket: process.env.R2_BUCKET_NAME!, Key: key }))
      } catch (error) {
        console.error("Skipping invalid image URL during post deletion", error)
      }
    }

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
