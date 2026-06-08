"use server"

import { postSchema } from "@/schemas/postSchema"
import { toNullString } from "@/lib/normalize"
import { supabase } from "@/lib/supabase"

export async function createPost(input: unknown, userId: string) {
  // 1. スキーマ検証
  const parsed = postSchema.safeParse(input)
  if (!parsed.success) {
    console.error("Schema validation failed:", parsed.error.format())
    throw new Error("入力内容の形式が正しくありません")
  }

  const data = parsed.data
  const brand = toNullString(data.brandSlug)
  const designer = toNullString(data.designerSlug)

  // フロントエンドから渡される型に合わせる
  const yearValue = data.year ? String(data.year) : null
  const seasonType = data.season || null 

  const finalSeasonSlug = (seasonType && yearValue) ? `${yearValue}-${seasonType}` : null
  const finalCollectionSlug = finalSeasonSlug
    ? (brand ? `${brand}-${finalSeasonSlug}` : finalSeasonSlug)
    : null

  // ブランド/デザイナーの解決ロジック（既存維持）
  let finalBrand = brand
  if (brand) {
    const { data: b } = await supabase.from("brands").select("slug").or(`slug.eq.${brand},name.eq.${brand}`).maybeSingle()
    if (b?.slug) finalBrand = b.slug
  }

  let finalDesigner = designer
  if (designer) {
    const { data: d } = await supabase.from("designers").select("slug").or(`slug.eq.${designer},name.eq.${designer}`).maybeSingle()
    if (d?.slug) finalDesigner = d.slug
  }

  // データベース挿入
  const { data: post, error } = await supabase
    .from("posts")
    .insert({
      user_id: userId,
      title: data.title,
      description: data.description,
      image_urls: data.imageUrls,
      brand_slug: finalBrand,
      designer_slug: finalDesigner,
      season_slug: finalSeasonSlug,
      collection_slug: finalCollectionSlug,
      season: seasonType,
      year: yearValue ? parseInt(yearValue, 10) : null,
    })
    .select()
    .single()

  if (error) {
    console.error("DB Insert Error:", error)
    throw new Error("データベースへの書き込みに失敗しました")
  }

  // タグの紐付け
  if (data.selectedTags?.length) {
    await supabase.from("post_tags").insert(
      data.selectedTags.map((tagId: string) => ({
        post_id: post.id,
        tag_id: tagId,
      }))
    )
  }

  return post
}