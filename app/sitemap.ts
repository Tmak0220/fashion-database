import { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://fashdb.com";

  const [
    { data: brands },
    { data: designers },
    { data: posts },
    { data: tags },
    { data: collections },
  ] = await Promise.all([
    supabase.from("brands").select("region_slug, country_slug, slug, updated_at"),
    supabase.from("designers").select("region_slug, country_slug, slug, updated_at"),
    supabase.from("posts").select("id, updated_at"),
    supabase.from("tags").select("slug, updated_at"),
    supabase.from("collections").select("brand_slug, slug, updated_at"),
  ]);

  const brandUrls = brands?.map((b) => ({
    url: `${baseUrl}/brands/${b.region_slug}/${b.country_slug}/${b.slug}`,
    lastModified: b.updated_at ? new Date(b.updated_at) : new Date(),
  })) || [];

  const designerUrls = designers?.map((d) => ({
    url: `${baseUrl}/designers/${d.region_slug}/${d.country_slug}/${d.slug}`,
    lastModified: d.updated_at ? new Date(d.updated_at) : new Date(),
  })) || [];

  const postUrls = posts?.map((p) => ({
    url: `${baseUrl}/posts/${p.id}`,
    lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
  })) || [];

  const tagUrls = tags?.map((t) => ({
    url: `${baseUrl}/tags/${t.slug}`,
    lastModified: t.updated_at ? new Date(t.updated_at) : new Date(),
  })) || [];

  const uniqueBrandSlugs = Array.from(
    new Set(collections?.map((c) => c.brand_slug).filter(Boolean))
  );
  const collectionBrandUrls = uniqueBrandSlugs.map((brandSlug) => {
    const related = collections?.filter((c) => c.brand_slug === brandSlug) || [];
    const latestUpdate = related.reduce((latest, current) => {
      if (!latest || !current.updated_at) return current.updated_at || latest;
      return new Date(current.updated_at) > new Date(latest) ? current.updated_at : latest;
    }, "");

    return {
      url: `${baseUrl}/collections/${brandSlug}`,
      lastModified: latestUpdate ? new Date(latestUpdate) : new Date(),
    };
  });

  const collectionSeasonUrls = collections?.map((c) => ({
    url: `${baseUrl}/collections/${c.brand_slug}/${c.slug}`,
    lastModified: c.updated_at ? new Date(c.updated_at) : new Date(),
  })) || [];

  const uniqueSeasons = Array.from(
    new Set(collections?.map((c) => c.slug).filter(Boolean))
  );
  const seasonUrls = uniqueSeasons.map((seasonSlug) => {
    const related = collections?.filter((c) => c.slug === seasonSlug) || [];
    const latestUpdate = related.reduce((latest, current) => {
      if (!latest || !current.updated_at) return current.updated_at || latest;
      return new Date(current.updated_at) > new Date(latest) ? current.updated_at : latest;
    }, "");

    return {
      url: `${baseUrl}/collections/season/${seasonSlug}`,
      lastModified: latestUpdate ? new Date(latestUpdate) : new Date(),
    };
  });

  return [
    { url: baseUrl, lastModified: new Date() },
    { url: `${baseUrl}/brands`, lastModified: new Date() },
    { url: `${baseUrl}/designers`, lastModified: new Date() },
    ...brandUrls,
    ...designerUrls,
    ...postUrls,
    ...tagUrls,
    ...collectionBrandUrls,
    ...collectionSeasonUrls,
    ...seasonUrls,
  ];
}