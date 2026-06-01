"use client"

import Link from "next/link"
import CollapsibleDescription from "@/components/CollapsibleDescription"
import SectionHeading from "@/components/SectionHeading"

export type BrandLine = "mens" | "womens" | "both"

type Brand = {
  id: number
  brand_slug: string
  start_year: number
  end_year: number | null
  description: string | null
  line?: BrandLine | null
  brands: {
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

type BothRow = {
  kind: "both"
  brand: Brand
  anchorYear: number
}

type SplitRow = {
  kind: "split"
  mens?: Brand
  womens?: Brand
  anchorYear: number
}

type TimelineRow = BothRow | SplitRow

function sortedBrands(brands: Brand[]): Brand[] {
  return [...brands].sort(
    (a, b) => a.start_year - b.start_year
  )
}

function periodsOverlap(a: Brand, b: Brand): boolean {
    const aEnd = a.end_year ?? 9999
    const bEnd = b.end_year ?? 9999
  
    return (
      a.start_year <= bEnd &&
      b.start_year <= aEnd
    )
  }

function yearOffset(
  year: number,
  anchorYear: number
) {
  return (
    Math.max(0, year - anchorYear) *
    PX_PER_YEAR_OFFSET
  )
}

function buildTimelineRows(
  brands: Brand[]
): TimelineRow[] {
  const mens = sortedBrands(
    brands.filter((b) => b.line === "mens")
  )

  const womens = sortedBrands(
    brands.filter((b) => b.line === "womens")
  )

  const both = sortedBrands(
    brands.filter((b) => b.line === "both")
  )

  const usedMens = new Set<number>()
  const usedWomens = new Set<number>()

  const splitRows: SplitRow[] = []

  for (const m of mens) {
    const match =
      womens.find(
        (w) =>
          !usedWomens.has(w.id) &&
          w.start_year === m.start_year
      ) ??
      womens.find(
        (w) =>
          !usedWomens.has(w.id) &&
          periodsOverlap(m, w)
      )

    if (match) {
      usedMens.add(m.id)
      usedWomens.add(match.id)

      splitRows.push({
        kind: "split",
        mens: m,
        womens: match,
        anchorYear: Math.min(
          m.start_year,
          match.start_year
        ),
      })
    }
  }

  for (const m of mens) {
    if (!usedMens.has(m.id)) {
      splitRows.push({
        kind: "split",
        mens: m,
        anchorYear: m.start_year,
      })
    }
  }

  for (const w of womens) {
    if (!usedWomens.has(w.id)) {
      splitRows.push({
        kind: "split",
        womens: w,
        anchorYear: w.start_year,
      })
    }
  }

  const bothRows: BothRow[] = both.map(
    (brand) => ({
      kind: "both",
      brand,
      anchorYear: brand.start_year,
    })
  )

  return [...bothRows, ...splitRows].sort(
    (a, b) =>
      a.anchorYear - b.anchorYear ||
      a.kind.localeCompare(b.kind)
  )
}

function BrandEntry({
  brand,
  centered = false,
}: {
  brand: Brand
  centered?: boolean
}) {

  if (!brand.brands) return null

  const align = centered
    ? "text-center"
    : ""

  return (
    <div className={align}>
      <p
        className={`type-label text-[11px] tabular-nums ${align}`}
      >
        {brand.start_year}
        {" — "}
        {brand.end_year ?? "Present"}
      </p>

      <Link
        href={`/brands/${brand.brands.region_slug}/${brand.brands.country_slug}/${brand.brand_slug}`}
        className="group mt-3 block"
      >
        <h3 className="type-display text-[1.75rem] text-foreground transition-colors group-hover:text-muted">
          {brand.brands.name}
        </h3>

        <p className="mt-1.5 text-sm tracking-[0.04em] text-muted">
          {brand.brands.name_ja}
        </p>
      </Link>
    </div>
  )
}

function ColumnBrandEntry({
  brand,
}: {
  brand: Brand
}) {
  return (
    <div className="text-center">
      <BrandEntry
        brand={brand}
        centered
      />

      <CollapsibleDescription
        description={brand.description}
        centered
      />
    </div>
  )
}

function SplitRowView({
  row,
}: {
  row: SplitRow
}) {
  return (
    <div className="grid grid-cols-1 items-start gap-12 md:grid-cols-2 md:gap-24">
      <div
        style={{
          paddingTop: row.mens
            ? yearOffset(
                row.mens.start_year,
                row.anchorYear
              )
            : 0,
        }}
      >
        {row.mens ? (
          <ColumnBrandEntry
            brand={row.mens}
          />
        ) : null}
      </div>

      <div
        style={{
          paddingTop: row.womens
            ? yearOffset(
                row.womens.start_year,
                row.anchorYear
              )
            : 0,
        }}
      >
        {row.womens ? (
          <ColumnBrandEntry
            brand={row.womens}
          />
        ) : null}
      </div>
    </div>
  )
}

export default function DesignerBrandTimeline({
  brands,
}: Props) {
  const withLine = brands.filter(
    (b) => b.line != null
  )

  const hasLineData =
    withLine.length > 0

  if (!hasLineData) {
    return (
      <section className="mt-20">
        <SectionHeading
          title="Brands"
          titleJa="担当ブランド"
        />

        <div className="mt-10 space-y-10">
          {sortedBrands(brands).map(
            (brand) => (
              <div key={brand.id}>
                <BrandEntry
                  brand={brand}
                />

                <CollapsibleDescription
                  description={
                    brand.description
                  }
                />
              </div>
            )
          )}
        </div>
      </section>
    )
  }

  const rows =
    buildTimelineRows(withLine)

  return (
    <section className="mt-20">
      <SectionHeading
        title="Brands"
        titleJa="担当ブランド"
      />

      <div className="mt-10 grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-24">
        <h3 className="text-center text-xs tracking-[0.08em] text-muted">
          メンズ
        </h3>

        <h3 className="text-center text-xs tracking-[0.08em] text-muted">
          ウィメンズ
        </h3>
      </div>

      <div className="mt-6 flex flex-col gap-10">
        {rows.map((row) => {
          if (row.kind === "both") {
            return (
              <div
                key={`both-${row.brand.id}`}
                className="text-center"
              >
                <BrandEntry
                  brand={row.brand}
                  centered
                />

                <CollapsibleDescription
                  description={
                    row.brand.description
                  }
                  centered
                />
              </div>
            )
          }

          return (
            <SplitRowView
              key={`split-${row.mens?.id ?? "m"}-${row.womens?.id ?? "w"}`}
              row={row}
            />
          )
        })}
      </div>
    </section>
  )
}