"use server"

import { createClient } from "@supabase/supabase-js"
import { S3Client, CopyObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3"

const r2 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})

async function moveToPermanentStorage(tmpUrl: string): Promise<string> {
  if (!tmpUrl.includes("/tmp/")) return tmpUrl

  try {
    const urlObj = new URL(tmpUrl)
    const srcKey = decodeURIComponent(urlObj.pathname.slice(1))
    const destKey = srcKey.replace(/^tmp\//, "posts/")

    await r2.send(
      new CopyObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        CopySource: `${process.env.R2_BUCKET_NAME}/${srcKey}`,
        Key: destKey,
      })
    )

    await r2.send(
      new DeleteObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: srcKey,
      })
    )

    return `${urlObj.origin}/${destKey}`
  } catch (err) {
    console.error(`Failed to move file to permanent storage: ${tmpUrl}`, err)
    return tmpUrl
  }
}

export async function createPost(input: any, userId: string) {
  try {
    if (!input.title?.trim()) throw new Error("タイトルは必須です")
    if (!input.imageUrls?.length) throw new Error("画像は1枚以上必要です")

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const currentUserId = userId
    if (!currentUserId) throw new Error("ユーザー認証に失敗しました")

    const permanentImageUrls = await Promise.all(
      input.imageUrls.map((url: string) => moveToPermanentStorage(url))
    )

    const insertPayload = {
      user_id: currentUserId,
      title: input.title.trim(),
      description: input.description?.trim() || null,
      image_urls: permanentImageUrls,
      brand_slug: input.brandSlug?.trim() || null,
      designer_slug: input.designerSlug?.trim() || null,
      season: input.season || null,
      year: input.year ? parseInt(input.year, 10) : null,
      season_slug: (input.season && input.year) ? `${input.year}-${input.season}` : null,
      collection_slug: (input.season && input.year && input.brandSlug)
        ? `${input.brandSlug.trim()}-${input.year}-${input.season}`
        : null,
    }

    const { data: post, error: postError } = await supabaseAdmin
      .from("posts")
      .insert(insertPayload)
      .select()
      .single()

    if (postError) throw new Error(`投稿の保存に失敗しました: ${postError.message}`)

    if (input.selectedTags?.length > 0) {
      const tagPayload = input.selectedTags.map((tagId: string) => ({
        post_id: post.id,
        tag_id: tagId,
      }))

      const { error: tagError } = await supabaseAdmin.from("post_tags").insert(tagPayload)
      if (tagError) throw new Error("タグの紐付けに失敗しました")
    }

    return post
  } catch (err: any) {
    console.error("CreatePost Error:", err.message)
    throw new Error(err.message)
  }
}