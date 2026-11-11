import { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase";
import { SITE_URL } from "@/lib/site";

export const revalidate = 3600;

type RouteRelation = { slug: string } | { slug: string }[] | null;
type EntityRouteRow = {
  slug: string;
  updated_at: string | null;
  regions: RouteRelation;
  countries: RouteRelation;
};
type PostRouteRow = { id: string; year: number | null; season: string | null; updated_at: string | null; image_urls: string[] | null; brands: RouteRelation };
type CollectionRouteRow = { year: number; season: string; updated_at: string | null; brands: RouteRelation };

const relationSlug = (relation: RouteRelation) =>
  (Array.isArray(relation) ? relation[0]?.slug : relation?.slug) || "unknown";

const modified = (value: string | null) => value ? { lastModified: new Date(value) } : {};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_URL;

  const [
    { data: brands },
    { data: designers },
    { data: posts },
    { data: tags },
    { data: collections },
  ] = await Promise.all([
    supabase.from("brands").select("slug, updated_at, regions(slug), countries(slug)"),
    supabase.from("designers").select("slug, updated_at, regions(slug), countries(slug)"),
    supabase.from("posts").select("id, year, season, updated_at, image_urls, brands!posts_brand_id_fkey(slug)"),
    supabase.from("tags").select("slug, updated_at"),
    supabase.from("collections").select("year, season, updated_at, brands!collections_brand_id_fkey(slug)"),
  ]);

  const brandUrls = (brands as unknown as EntityRouteRow[] | null)?.map((b) => {
    const regionSlug = relationSlug(b.regions);
    const countrySlug = relationSlug(b.countries);
    return {
      url: `${baseUrl}/brands/${regionSlug}/${countrySlug}/${b.slug}`,
      ...modified(b.updated_at),
    };
  }) || [];

  const designerUrls = (designers as unknown as EntityRouteRow[] | null)?.map((d) => {
    const regionSlug = relationSlug(d.regions);
    const countrySlug = relationSlug(d.countries);
    return {
      url: `${baseUrl}/designers/${regionSlug}/${countrySlug}/${d.slug}`,
      ...modified(d.updated_at),
    };
  }) || [];

  const postRows = (posts as unknown as PostRouteRow[] | null) || [];
  const postUrls = postRows.map((p) => {
    const relatedSlug = relationSlug(p.brands);
    const prefix = relatedSlug === "unknown" ? "archive" : relatedSlug;
    return {
      url: `${baseUrl}/posts/${prefix}-${p.id}`,
      ...modified(p.updated_at),
      images: p.image_urls || [],
    };
  }) || [];

  const tagUrls = tags?.map((t) => ({
    url: `${baseUrl}/tags/${t.slug}`,
    ...modified(t.updated_at),
  })) || [];

  const collectionRows = (collections as unknown as CollectionRouteRow[] | null) || [];
  const uniqueBrandSlugs = Array.from(
    new Set(collectionRows.map((c) => relationSlug(c.brands)).filter((slug) => slug !== "unknown"))
  );
  const collectionBrandUrls = uniqueBrandSlugs.map((brandSlug) => {
    const related = collectionRows.filter((c) => relationSlug(c.brands) === brandSlug);
    const latestUpdate = related.reduce((latest, current) => {
      if (!latest || !current.updated_at) return current.updated_at || latest;
      return new Date(current.updated_at) > new Date(latest) ? current.updated_at : latest;
    }, "");

    return {
      url: `${baseUrl}/collections/${brandSlug}`,
      ...modified(latestUpdate || null),
    };
  });

  const collectionSeasonUrls = collectionRows.map((c) => ({
    url: `${baseUrl}/collections/${relationSlug(c.brands)}/${c.year}-${c.season}`,
    ...modified(c.updated_at),
  })) || [];

  const virtualCollectionSeasonUrls = postRows
    .filter((post) => post.brands && post.year && post.season)
    .map((post) => ({
      url: `${baseUrl}/collections/${relationSlug(post.brands)}/${post.year}-${post.season}`,
      ...modified(post.updated_at),
    }));

  const uniqueSeasons = Array.from(
    new Set(postRows.filter((post) => post.year && post.season).map((post) => `${post.year}-${post.season}`))
  );
  const seasonUrls = uniqueSeasons.map((seasonSlug) => {
    const related = postRows.filter((post) => `${post.year}-${post.season}` === seasonSlug);
    const latestUpdate = related.reduce((latest, current) => {
      if (!latest || !current.updated_at) return current.updated_at || latest;
      return new Date(current.updated_at) > new Date(latest) ? current.updated_at : latest;
    }, "");

    return {
      url: `${baseUrl}/collections/season/${seasonSlug}`,
      ...modified(latestUpdate || null),
    };
  });

  const unlocalizedEntries: MetadataRoute.Sitemap = [
    { url: baseUrl },
    { url: `${baseUrl}/brands` },
    { url: `${baseUrl}/designers` },
    { url: `${baseUrl}/collections` },
    { url: `${baseUrl}/guide` },
    { url: `${baseUrl}/legal` },
    { url: `${baseUrl}/privacy` },
    { url: `${baseUrl}/terms` },
    ...brandUrls,
    ...designerUrls,
    ...postUrls,
    ...tagUrls,
    ...collectionBrandUrls,
    ...collectionSeasonUrls,
    ...virtualCollectionSeasonUrls,
    ...seasonUrls,
  ];

  const uniqueEntries = Array.from(new Map(unlocalizedEntries.map((entry) => [entry.url, entry])).values());

  return uniqueEntries.flatMap((entry) => {
    const pathname = new URL(entry.url).pathname.replace(/^\/$/, "")
    const languages = {
      ja: `${baseUrl}${pathname}`,
      en: `${baseUrl}/en${pathname}`,
    }
    return (["ja", "en"] as const).map((locale) => ({
      ...entry,
      url: languages[locale],
      alternates: { languages },
    }))
  })
}
