"use server"

import { createClient } from "@supabase/supabase-js"
import { S3Client, CopyObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3"
import { createClient as createServerClient } from "@/lib/supabase-server"
import { getR2KeyFromUrl, getR2PublicUrl, isOwnedPostKey, isOwnedTemporaryKey } from "@/lib/r2-keys"
import { resolveEntity } from "@/lib/entity-resolution"

const r2 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})

type PostInput = {
  title?: string
  description?: string
  imageUrls?: string[]
  brandSlug?: string | null
  designerSlug?: string | null
  collectionSlug?: string | null
  seasonSlug?: string | null
  season?: string
  year?: string
  selectedTags?: string[]
}

async function moveToPermanentStorage(tmpUrl: string, userId: string): Promise<string> {
  try {
    const srcKey = getR2KeyFromUrl(tmpUrl)
    if (!srcKey.startsWith("tmp/")) {
      if (!isOwnedPostKey(srcKey, userId)) throw new Error("Post image does not belong to this user")
      return tmpUrl
    }
    if (!isOwnedTemporaryKey(srcKey, userId)) throw new Error("Temporary image does not belong to this user")
    const destKey = srcKey.replace(/^tmp\//, "posts/")
    const bucketName = process.env.R2_BUCKET_NAME!

    await r2.send(
      new CopyObjectCommand({
        Bucket: bucketName,
        CopySource: `${bucketName}/${srcKey}`,
        Key: destKey,
      })
    )

    await r2.send(
      new DeleteObjectCommand({
        Bucket: bucketName,
        Key: srcKey,
      })
    )

    return `${getR2PublicUrl()}/${destKey}`
  } catch (err) {
    console.error(`Failed to move file to permanent storage: ${tmpUrl}`, err)
    throw new Error("画像の保存に失敗しました")
  }
}

export async function createPost(input: PostInput) {
  try {
    if (!input.title?.trim()) throw new Error("タイトルは必須です")
    if (!input.imageUrls?.length) throw new Error("画像は1枚以上必要です")

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const serverClient = await createServerClient()
    const { data: { user } } = await serverClient.auth.getUser()
    if (!user) throw new Error("ユーザー認証に失敗しました")
    const currentUserId = user.id

    const permanentImageUrls = await Promise.all(
      input.imageUrls.map((url) => moveToPermanentStorage(url, currentUserId))
    )
    const [brand, designer] = await Promise.all([
      resolveEntity(supabaseAdmin, "brands", input.brandSlug),
      resolveEntity(supabaseAdmin, "designers", input.designerSlug),
    ])

    const insertPayload = {
      user_id: currentUserId,
      title: input.title.trim(),
      description: input.description?.trim() || null,
      image_urls: permanentImageUrls,
      brand_id: brand?.id ?? null,
      designer_id: designer?.id ?? null,
      brand_slug: brand?.slug ?? null,
      designer_slug: designer?.slug ?? null,
      season: input.season || null,
      year: input.year ? parseInt(input.year, 10) : null,
      season_slug: (input.season && input.year) ? `${input.year}-${input.season}` : null,
      collection_slug: (input.season && input.year && brand)
        ? `${brand.slug}-${input.year}-${input.season}`
        : null,
    }

    const { data: post, error: postError } = await supabaseAdmin
      .from("posts")
      .insert(insertPayload)
      .select()
      .single()

    if (postError) throw new Error(`投稿の保存に失敗しました: ${postError.message}`)

    const selectedTags = input.selectedTags ?? []
    if (selectedTags.length > 0) {
      const tagPayload = selectedTags.map((tagId: string) => ({
        post_id: post.id,
        tag_id: tagId,
      }))

      const { error: tagError } = await supabaseAdmin.from("post_tags").insert(tagPayload)
      if (tagError) throw new Error("タグの紐付けに失敗しました")
    }

    return post
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "投稿の作成に失敗しました"
    console.error("CreatePost Error:", message)
    throw new Error(message)
  }
}

export async function updatePost(postId: string, input: PostInput) {
  try {
    if (!input.title?.trim()) throw new Error("タイトルは必須です")
    if (!input.imageUrls?.length) throw new Error("画像は1枚以上必要です")

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const serverClient = await createServerClient()
    const { data: { user } } = await serverClient.auth.getUser()
    if (!user) throw new Error("ユーザー認証に失敗しました")

    const { data: ownedPost } = await supabaseAdmin
      .from("posts")
      .select("id")
      .eq("id", postId)
      .eq("user_id", user.id)
      .maybeSingle()
    if (!ownedPost) throw new Error("投稿の編集権限がありません")

    const permanentImageUrls = await Promise.all(
      input.imageUrls.map((url) => moveToPermanentStorage(url, user.id))
    )
    const [brand, designer] = await Promise.all([
      resolveEntity(supabaseAdmin, "brands", input.brandSlug),
      resolveEntity(supabaseAdmin, "designers", input.designerSlug),
    ])

    const updatePayload = {
      title: input.title.trim(),
      description: input.description?.trim() || null,
      image_urls: permanentImageUrls,
      brand_id: brand?.id ?? null,
      designer_id: designer?.id ?? null,
      brand_slug: brand?.slug ?? null,
      designer_slug: designer?.slug ?? null,
      collection_slug: input.collectionSlug,
      season_slug: input.seasonSlug,
      season: input.season || null,
      year: input.year ? parseInt(input.year, 10) : null,
    }

    const { error: postError } = await supabaseAdmin
      .from("posts")
      .update(updatePayload)
      .eq("id", postId)
      .eq("user_id", user.id)

    if (postError) throw postError

    await supabaseAdmin.from("post_tags").delete().eq("post_id", postId)
    
    const selectedTags = input.selectedTags ?? []
    if (selectedTags.length > 0) {
      const tagPayload = selectedTags.map((tagId: string) => ({
        post_id: postId,
        tag_id: tagId,
      }))
      const { error: tagError } = await supabaseAdmin.from("post_tags").insert(tagPayload)
      if (tagError) throw new Error("タグの紐付けに失敗しました")
    }

    return { success: true, imageUrls: permanentImageUrls }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "投稿の更新に失敗しました"
    console.error("UpdatePost Error:", message)
    throw new Error(message)
  }
}
