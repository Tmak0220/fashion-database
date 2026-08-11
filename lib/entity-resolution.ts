import "server-only"

import type { SupabaseClient } from "@supabase/supabase-js"

export type ResolvedEntity = { id: number; slug: string } | null
export type ResolvedCollection = { id: number; slug: string } | null

type EntityRow = {
  id: number
  slug: string
  name: string | null
  name_ja: string | null
  search_keywords: string[] | string | null
}

export function normalizeEntityName(value: string) {
  return value.normalize("NFKC").trim().toLocaleLowerCase().replace(/[\s‐‑‒–—―ー・･_-]+/g, "")
}

function keywordsOf(row: EntityRow) {
  const keywords = Array.isArray(row.search_keywords)
    ? row.search_keywords
    : typeof row.search_keywords === "string"
      ? row.search_keywords.split(",")
      : []
  return [row.slug, row.name, row.name_ja, ...keywords]
    .filter((value): value is string => Boolean(value))
    .map(normalizeEntityName)
}

export async function resolveEntity(
  admin: SupabaseClient,
  table: "brands" | "designers",
  rawValue: string | null | undefined
): Promise<ResolvedEntity> {
  const value = rawValue?.trim()
  if (!value) return null
  const normalized = normalizeEntityName(value)

  const { data, error } = await admin
    .from(table)
    .select("id, slug, name, name_ja, search_keywords")

  if (error) throw new Error(`${table}の照合に失敗しました`)
  const matches = ((data ?? []) as EntityRow[]).filter((row) => keywordsOf(row).includes(normalized))
  if (matches.length === 1) return { id: matches[0].id, slug: matches[0].slug }
  if (matches.length > 1) throw new Error(`「${value}」に一致する候補が複数あります。候補から選択してください。`)

  const pendingSlug = `pending-${table === "brands" ? "brand" : "designer"}-${crypto.randomUUID()}`
  const { data: created, error: createError } = await admin
    .from(table)
    .insert({
      slug: pendingSlug,
      name: value,
      name_ja: value,
      normalized_name: normalized,
      search_keywords: value,
      status: "pending",
    })
    .select("id, slug")
    .single()

  if (createError || !created) throw new Error(`未登録の${table === "brands" ? "ブランド" : "デザイナー"}を保存できませんでした`)
  return { id: created.id, slug: created.slug }
}

export async function resolveCollection(
  admin: SupabaseClient,
  brand: ResolvedEntity,
  designer: ResolvedEntity,
  yearValue: string | null | undefined,
  seasonValue: string | null | undefined
): Promise<ResolvedCollection> {
  const year = Number(yearValue)
  const season = seasonValue?.trim().toLowerCase()
  if (!brand || !Number.isInteger(year) || !season) return null

  const slug = `${brand.slug}-${year}-${season}`
  const { data, error } = await admin
    .from("collections")
    .upsert(
      { brand_id: brand.id, designer_id: designer?.id ?? null, brand_slug: brand.slug, year, season, slug },
      { onConflict: "brand_id,year,season" }
    )
    .select("id, slug")
    .single()

  if (error || !data) throw new Error("コレクションの紐付けに失敗しました")
  return { id: data.id, slug: data.slug }
}
