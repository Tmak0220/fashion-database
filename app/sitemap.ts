import { MetadataRoute } from "next"

import { supabase } from "@/lib/supabase"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {

  const baseUrl = "https://your-domain.com"

  const { data: brands } = await supabase
    .from("brands")
    .select(`
      region_slug,
      country_slug,
      slug
    `)

  const brandUrls =
    brands?.map((brand) => ({
      url:
        `${baseUrl}/brands/${brand.region_slug}/${brand.country_slug}/${brand.slug}`,
      lastModified: new Date(),
    })) || []

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
    },

    {
      url: `${baseUrl}/brands`,
      lastModified: new Date(),
    },

    ...brandUrls,
  ]
}