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
    // どんなドメインから始まっていても、確実に「tmp/」以降のみを抽出する
    const match = tmpUrl.match(/tmp\/.+$/)
    if (!match) return tmpUrl
    
    // R2のCopySource用に、URLエンコードされたままの状態のキーを取得
    const rawSrcKey = match[0] 
    // 削除コマンド用に、デコードした状態のキーを取得
    const srcKey = decodeURIComponent(rawSrcKey)
    // tmp/ を外した、バケット直下用のファイル名を作成
    const destKey = srcKey.replace(/^tmp\//, "")
    const bucketName = process.env.R2_BUCKET_NAME!

    await r2.send(
      new CopyObjectCommand({
        Bucket: bucketName,
        // Cloudflare R2のバグを防ぐため、バケット名とエンコード済みのキーをURLエンコードして結合
        CopySource: encodeURIComponent(`${bucketName}/${rawSrcKey}`),
        Key: destKey,
      })
    )

    await r2.send(
      new DeleteObjectCommand({
        Bucket: bucketName,
        Key: srcKey,
      })
    )

    const baseUrl = process.env.R2_PUBLIC_URL?.replace(/\/$/, "") || "https://images.fashdb.com"
    return `${baseUrl}/${destKey}`
  } catch (err: any) {
    console.error(`Failed to move file to permanent storage: ${tmpUrl}`, err)
    // ごまかさずにエラーをそのまま画面へ投げて、原因を可視化させます
    throw new Error(`R2移行エラー: ${err.name || err.message || "Unknown Error"}`)
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