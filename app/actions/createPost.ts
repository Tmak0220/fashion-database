"use server"

import { supabase } from "@/lib/supabase"

/**
 * 投稿を作成するサーバーアクション
 * @param input - フォームからの入力データ
 * @param userId - 投稿者のユーザーID
 */
export async function createPost(input: any, userId: string) {
  try {
    // 1. 入力データのバリデーション（簡易版）
    if (!input.title || input.title.trim() === "") {
      throw new Error("タイトルは必須です")
    }
    if (!input.imageUrls || input.imageUrls.length === 0) {
      throw new Error("画像は1枚以上必要です")
    }

    // 2. データの正規化
    const insertPayload = {
      user_id: userId,
      title: input.title.trim(),
      description: input.description ? input.description.trim() : null,
      image_urls: input.imageUrls,
      brand_slug: input.brandSlug ? input.brandSlug.trim() : null,
      designer_slug: input.designerSlug ? input.designerSlug.trim() : null,
      season: input.season || null,
      year: input.year ? parseInt(input.year, 10) : null,
      // スラグの生成をここで行う（計算結果をDBへ）
      season_slug: (input.season && input.year) ? `${input.year}-${input.season}` : null,
      collection_slug: (input.season && input.year && input.brandSlug) 
        ? `${input.brandSlug.trim()}-${input.year}-${input.season}` 
        : null,
    }

    // 3. 投稿の挿入
    const { data: post, error: postError } = await supabase
      .from("posts")
      .insert(insertPayload)
      .select()
      .single()

    if (postError) {
      console.error("Post Insert Error:", postError)
      throw new Error(`DB投稿失敗: ${postError.message}`)
    }

    // 4. タグの挿入
    if (input.selectedTags && input.selectedTags.length > 0) {
      const tagPayload = input.selectedTags.map((tagId: string) => ({
        post_id: post.id,
        tag_id: tagId,
      }))

      const { error: tagError } = await supabase.from("post_tags").insert(tagPayload)
      if (tagError) {
        console.error("Tag Insert Error:", tagError)
        // タグが失敗しても投稿自体は成功したとみなすか、ここで throw するか選択
        throw new Error("タグの登録に失敗しました")
      }
    }

    return post
  } catch (err: any) {
    // エラー詳細をそのままクライアントに返す
    console.error("CreatePost Action Error:", err.message)
    throw new Error(err.message)
  }
}