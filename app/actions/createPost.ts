"use server"

import { postSchema } from "@/schemas/postSchema"
import { supabase } from "@/lib/supabase"

export async function createPost(input: unknown, userId: string) {
  try {
    const parsed = postSchema.safeParse(input)
    if (!parsed.success) {
      // バリデーションエラーの中身を詳細に送る
      throw new Error("Validation: " + JSON.stringify(parsed.error.flatten()))
    }

    const { data: post, error } = await supabase
      .from("posts")
      .insert({
        user_id: userId,
        title: parsed.data.title,
        image_urls: parsed.data.imageUrls,
        // ... 他の項目
      })
      .select()
      .single()

    if (error) {
      // データベースエラーを詳細に送る
      throw new Error(`DB_ERROR: ${error.code} - ${error.message}`)
    }
    
    return post
  } catch (e: any) {
    // ここが重要：エラーを隠さずそのままスローする
    throw new Error(e.message)
  }
}