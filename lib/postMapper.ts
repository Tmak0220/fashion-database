import { toNullString } from "./normalize"
import { buildSeasonSlug, buildCollectionSlug } from "./slug"

export const mapPostInput = (input: any) => {
  const brand = toNullString(input.brandSlug)
  const designer = toNullString(input.designerSlug)
  const year = input.year?.trim() || null

  const seasonSlug = buildSeasonSlug(year, input.seasonType)
  const collectionSlug = buildCollectionSlug(brand, seasonSlug)

  return {
    title: input.title,
    description: input.description,

    brand_slug: brand,
    designer_slug: designer,

    season_slug: seasonSlug,
    collection_slug: collectionSlug,

    year,
    image_urls: input.imageUrls,
    tags: input.selectedTags || [],
  }
}