import { supabase } from "@/lib/supabase"

export type SiteContent = {
  key: string
  content: string | null
  type?: string | null
  is_visible: boolean | null
  lang: string | null
}

const cache = new Map<string, SiteContent | null>()

type Options = {
  fallback?: string
  lang?: string
}

export async function useSiteContent(
  key: string,
  options: Options = {}
) {
  const lang = options.lang ?? "ja"

  const cacheKey = `${key}_${lang}`

  if (cache.has(cacheKey)) {
    return cache.get(cacheKey)
  }

  const { data, error } = await supabase
    .from("site_contents")
    .select("*")
    .eq("key", key)
    .eq("lang", lang)
    .maybeSingle()

  if (error) {
    console.error("useSiteContent error:", error)
  }

  const result = data as SiteContent | null

  cache.set(cacheKey, result)

  if (!result && options.fallback) {
    return {
      key,
      content: options.fallback,
      is_visible: true,
      lang,
    } as SiteContent
  }

  return result
}