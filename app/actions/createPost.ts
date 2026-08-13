"use server"

import { createClient } from "@supabase/supabase-js"
import { S3Client, CopyObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3"
import { getR2KeyFromUrl, getR2PublicUrl, isOwnedPostKey, isOwnedTemporaryKey } from "@/lib/r2-keys"
import { resolveCollection, resolveEntity } from "@/lib/entity-resolution"

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

async function deleteOwnedPostImage(url: string, userId: string) {
  const key = getR2KeyFromUrl(url)
  if (!isOwnedPostKey(key, userId)) throw new Error("Post image does not belong to this user")
  await r2.send(new DeleteObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: key,
  }))
}

export async function createPost(input: PostInput, accessToken: string) {
  try {
    if (!input.title?.trim()) throw new Error("タイトルは必須です")
    if (!input.imageUrls?.length) throw new Error("画像は1枚以上必要です")

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(accessToken)
    if (authError) throw new Error("ログイン情報を確認できませんでした。再度ログインしてください")
    if (!user) throw new Error("ユーザー認証に失敗しました")
    const currentUserId = user.id

    const permanentImageUrls = await Promise.all(
      input.imageUrls.map((url) => moveToPermanentStorage(url, currentUserId))
    )
    const [brand, designer] = await Promise.all([
      resolveEntity(supabaseAdmin, "brands", input.brandSlug),
      resolveEntity(supabaseAdmin, "designers", input.designerSlug),
    ])
    const collection = await resolveCollection(supabaseAdmin, brand, designer, input.year, input.season)

    const insertPayload = {
      user_id: currentUserId,
      title: input.title.trim(),
      description: input.description?.trim() || null,
      image_urls: permanentImageUrls,
      brand_id: brand?.id ?? null,
      designer_id: designer?.id ?? null,
      collection_id: collection?.id ?? null,
      season: input.season || null,
      year: input.year ? parseInt(input.year, 10) : null,
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

export async function updatePost(postId: string, input: PostInput, accessToken: string) {
  try {
    if (!input.title?.trim()) throw new Error("タイトルは必須です")
    if (!input.imageUrls?.length) throw new Error("画像は1枚以上必要です")

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(accessToken)
    if (authError) throw new Error("ログイン情報を確認できませんでした。再度ログインしてください")
    if (!user) throw new Error("ユーザー認証に失敗しました")

    const { data: ownedPost } = await supabaseAdmin
      .from("posts")
      .select("id, image_urls")
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
    const collection = await resolveCollection(supabaseAdmin, brand, designer, input.year, input.season)

    const updatePayload = {
      title: input.title.trim(),
      description: input.description?.trim() || null,
      image_urls: permanentImageUrls,
      brand_id: brand?.id ?? null,
      designer_id: designer?.id ?? null,
      collection_id: collection?.id ?? null,
      season: input.season || null,
      year: input.year ? parseInt(input.year, 10) : null,
    }

    const { error: postError } = await supabaseAdmin
      .from("posts")
      .update(updatePayload)
      .eq("id", postId)
      .eq("user_id", user.id)

    if (postError) throw postError

    const previousImageUrls = Array.isArray(ownedPost.image_urls)
      ? ownedPost.image_urls.filter((url): url is string => typeof url === "string")
      : []
    const removedImageUrls = previousImageUrls.filter((url) => !permanentImageUrls.includes(url))
    for (const url of removedImageUrls) {
      try {
        await deleteOwnedPostImage(url, user.id)
      } catch (error) {
        // The database update has succeeded. Log storage cleanup failures so a
        // temporary orphan never causes the user's edit itself to fail.
        console.error("Failed to remove replaced post image", error)
      }
    }

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
