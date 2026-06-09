import { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://fashdb.com";

  const [
    { data: brands },
    { data: designers },
    { data: posts },
    { data: tags },
  ] = await Promise.all([
    supabase.from("brands").select("region_slug, country_slug, slug, updated_at"),
    supabase.from("designers").select("region_slug, country_slug, slug, updated_at"),
    supabase.from("posts").select("id, updated_at"),
    supabase.from("tags").select("slug, updated_at"),
  ]);

  const brandUrls = brands?.map((b) => ({
    url: `${baseUrl}/brands/${b.region_slug}/${b.country_slug}/${b.slug}`,
    lastModified: b.updated_at,
  })) || [];

  const designerUrls = designers?.map((d) => ({
    url: `${baseUrl}/designers/${d.region_slug}/${d.country_slug}/${d.slug}`,
    lastModified: d.updated_at,
  })) || [];

  const postUrls = posts?.map((p) => ({
    url: `${baseUrl}/posts/${p.id}`,
    lastModified: p.updated_at,
  })) || [];

  const tagUrls = tags?.map((t) => ({
    url: `${baseUrl}/tags/${t.slug}`,
    lastModified: t.updated_at,
  })) || [];

  return [
    { url: baseUrl, lastModified: new Date() },
    { url: `${baseUrl}/brands`, lastModified: new Date() },
    { url: `${baseUrl}/designers`, lastModified: new Date() },
    ...brandUrls,
    ...designerUrls,
    ...postUrls,
    ...tagUrls,
  ];
}