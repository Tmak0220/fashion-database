"use client"

import Link from "next/link"
import { useState } from "react"
import SectionHeading from "@/components/SectionHeading"

export type BrandLine = "mens" | "womens" | "both"

type Brand = {
  id: number
  brand_slug: string // 👈 追加
  start_year: number
  end_year: number | null
  description: string | null
  line?: BrandLine | null
  brands: { // 👈 Supabaseのリレーション結果を想定
    name: string
    name_ja: string
    region_slug: string
    country_slug: string
  } | null
}

type Props = {
  brands: Brand[]
}

const PX_PER_YEAR_OFFSET = 24

type BothRow = { kind: "both"; brand: Brand; anchorYear: number }
type SplitRow = { kind: "split"; mens?: Brand; womens?: Brand; anchorYear: number }
type TimelineRow = BothRow | SplitRow

function sortedBrands(brands: Brand[]): Brand[] {
  return [...brands].sort((a, b) => a.start_year - b.start_year)
}

function periodsOverlap(a: Brand, b: Brand): boolean {
  const aEnd = a.end_year ?? 9999
  const bEnd = b.end_year ?? 9999
  return a.start_year <= bEnd && b.start_year <= aEnd
}

function yearOffset(year: number, anchorYear: number) {
  return Math.max(0, year - anchorYear) * PX_PER_YEAR_OFFSET
}

function buildTimelineRows(brands: Brand[]): TimelineRow[] {
  const mens = sortedBrands(brands.filter((b) => b.line === "mens"))
  const womens = sortedBrands(brands.filter((b) => b.line === "womens"))
  const both = sortedBrands(brands.filter((b) => b.line === "both"))

  const usedMens = new Set<number>()
  const usedWomens = new Set<number>()
  const splitRows: SplitRow[] = []

  for (const m of mens) {
    const match =
      womens.find((w) => !usedWomens.has(w.id) && w.start_year === m.start_year) ??
      womens.find((w) => !usedWomens.has(w.id) && periodsOverlap(m, w))

    if (match) {
      usedMens.add(m.id)
      usedWomens.add(match.id)
      splitRows.push({
        kind: "split",
        mens: m,
        womens: match,
        anchorYear: Math.min(m.start_year, match.start_year),
      })
    }
  }

  for (const m of mens) {
    if (!usedMens.has(m.id)) {
      splitRows.push({ kind: "split", mens: m, anchorYear: m.start_year })
    }
  }

  for (const w of womens) {
    if (!usedWomens.has(w.id)) {
      splitRows.push({ kind: "split", womens: w, anchorYear: w.start_year })
    }
  }

  const bothRows: BothRow[] = both.map((brand) => ({
    kind: "both",
    brand,
    anchorYear: brand.start_year,
  }))

  return [...bothRows, ...splitRows].sort(
    (a, b) => a.anchorYear - b.anchorYear || a.kind.localeCompare(b.kind),
  )
}

function BrandEntry({
  brand,
  centered = false,
}: {
  brand: Brand
  centered?: boolean
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  if (!brand.brands) return null

  return (
    <div className={`text-center flex flex-col items-center w-full`}>
      <p className="type-label text-[11px] tabular-nums text-subtle tracking-widest">
        {brand.start_year} — {brand.end_year ?? "Present"}
      </p>

      <Link
        href={`/brands/${brand.brands.region_slug}/${brand.brands.country_slug}/${brand.brand_slug}`}
        className="group mt-2 block mx-auto"
      >
        <h3 className="type-display text-2xl sm:text-[1.75rem] text-foreground tracking-[0.06em] uppercase font-light transition-colors group-hover:text-muted">
          {brand.brands.name}
        </h3>
        <p className="mt-1 text-[12px] tracking-[0.04em] text-muted">
          {brand.brands.name_ja}
        </p>
      </Link>

      {brand.description && (
        <div className="w-full flex flex-col items-center">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-4 group flex items-center gap-1.5 pb-0.5 border-b border-transparent hover:border-foreground/40 transition-all duration-300"
          >
            <span className="text-[10px] sm:text-[11px] tracking-[0.06em] text-muted group-hover:text-foreground transition-colors">
              {isExpanded ? "Close" : "Description"}
            </span>
            <span className={`text-[10px] text-muted group-hover:text-foreground transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}>
              ↓
            </span>
          </button>

          <div 
            className={`w-full max-w-xl transition-all duration-500 ease-in-out grid ${
              isExpanded ? "grid-rows-[1fr] opacity-100 mt-6 pb-2" : "grid-rows-[0fr] opacity-0"
            }`}
          >
            <div className="overflow-hidden min-h-0 w-full">
              <p className="text-xs sm:text-[13px] text-foreground/80 leading-[2.1] tracking-wide text-center whitespace-pre-wrap px-4 sm:px-0">
                {brand.description}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function DesignerBrandTimeline({ brands }: Props) {
  const withLine = brands.filter((b) => b.line != null)
  const hasLineData = withLine.length > 0

  if (!hasLineData) {
    return (
      <section className="mt-28 sm:mt-36">
        <SectionHeading title="Brands" titleJa="担当ブランド" />
        <div className="mt-14 space-y-16">
          {sortedBrands(brands).map((brand) => (
            <BrandEntry key={brand.id} brand={brand} centered />
          ))}
        </div>
      </section>
    )
  }

  const rows = buildTimelineRows(withLine)

  return (
    <section className="mt-28 sm:mt-36">
      <SectionHeading title="Brands" titleJa="担当ブランド" />

      <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-24">
        <h3 className="text-center text-[10px] tracking-[0.15em] uppercase text-subtle font-medium border-b border-border/40 pb-3">
          Menswear
        </h3>
        <h3 className="text-center text-[10px] tracking-[0.15em] uppercase text-subtle font-medium border-b border-border/40 pb-3">
          Womenswear
        </h3>
      </div>

      <div className="mt-12 flex flex-col gap-16">
        {rows.map((row) => {
          if (row.kind === "both") {
            return (
              <div key={`both-${row.brand.id}`} className="text-center">
                <BrandEntry brand={row.brand} centered />
              </div>
            )
          }

          return (
            <div
              key={`split-${row.mens?.id ?? "m"}-${row.womens?.id ?? "w"}`}
              className="grid grid-cols-1 items-start gap-16 md:grid-cols-2 md:gap-24"
            >
              <div style={{ paddingTop: row.mens ? yearOffset(row.mens.start_year, row.anchorYear) : 0 }}>
                {row.mens && <BrandEntry brand={row.mens} centered={false} />}
              </div>
              <div style={{ paddingTop: row.womens ? yearOffset(row.womens.start_year, row.anchorYear) : 0 }}>
                {row.womens && <BrandEntry brand={row.womens} centered={false} />}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}