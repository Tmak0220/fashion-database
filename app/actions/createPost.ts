"use server"

import { supabase } from "@/lib/supabase"

export async function createPost(input: any, userId: string) {
  try {
    if (!input.title?.trim()) throw new Error("タイトルは必須です")
    if (!input.imageUrls?.length) throw new Error("画像は1枚以上必要です")

    const { data: { user } } = await supabase.auth.getUser()
    const currentUserId = user?.id || userId
    if (!currentUserId) throw new Error("ユーザー認証に失敗しました")

    const insertPayload = {
      user_id: currentUserId,
      title: input.title.trim(),
      description: input.description?.trim() || null,
      image_urls: input.imageUrls,
      brand_slug: input.brandSlug?.trim() || null,
      designer_slug: input.designerSlug?.trim() || null,
      season: input.season || null,
      year: input.year ? parseInt(input.year, 10) : null,
      season_slug: (input.season && input.year) ? `${input.year}-${input.season}` : null,
      collection_slug: (input.season && input.year && input.brandSlug)
        ? `${input.brandSlug.trim()}-${input.year}-${input.season}`
        : null,
    }

    const { data: post, error: postError } = await supabase
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

      const { error: tagError } = await supabase.from("post_tags").insert(tagPayload)
      if (tagError) throw new Error("タグの紐付けに失敗しました")
    }

    return post
  } catch (err: any) {
    console.error("CreatePost Error:", err.message)
    throw new Error(err.message)
  }
}