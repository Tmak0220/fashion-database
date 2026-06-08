"use server"

import { postSchema } from "@/schemas/postSchema"
import { toNullString } from "@/lib/normalize"
import { supabase } from "@/lib/supabase"

export async function createPost(input: unknown, userId: string) {
  const parsed = postSchema.safeParse(input)
  if (!parsed.success) {
    throw new Error("invalid input")
  }

  const data = parsed.data

  const brand = toNullString(data.brandSlug)
  const designer = toNullString(data.designerSlug)

  const seasonType = data.seasonType || null
  const yearValue = data.year?.trim() || null

  const finalSeasonSlug =
    seasonType && yearValue
      ? `${yearValue}-${seasonType}`
      : null

  const finalCollectionSlug =
    finalSeasonSlug
      ? (brand ? `${brand}-${finalSeasonSlug}` : finalSeasonSlug)
      : null

  let finalBrand = brand
  if (brand) {
    const { data: b } = await supabase
      .from("brands")
      .select("slug")
      .or(`slug.eq.${brand},name.eq.${brand}`)
      .maybeSingle()

    if (b?.slug) finalBrand = b.slug
  }

  let finalDesigner = designer
  if (designer) {
    const { data: d } = await supabase
      .from("designers")
      .select("slug")
      .or(`slug.eq.${designer},name.eq.${designer}`)
      .maybeSingle()

    if (d?.slug) finalDesigner = d.slug
  }

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
      year: yearValue,
    })
    .select()
    .single()

  if (error) throw error

  if (data.selectedTags?.length) {
    await supabase.from("post_tags").insert(
      data.selectedTags.map(tagId => ({
        post_id: post.id,
        tag_id: tagId,
      }))
    )
  }

  return post
}