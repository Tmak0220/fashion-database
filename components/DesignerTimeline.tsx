import Link from "next/link"
import CollapsibleDescription from "@/components/CollapsibleDescription"
import SectionHeading from "@/components/SectionHeading"

export type DesignerLine = "mens" | "womens" | "both"

type Designer = {
  id: number
  designer_slug: string
  start_year: number
  end_year: number
  description: string | null
  line?: DesignerLine | null
  designers: {
    name: string
    name_ja: string
    description: string
    region_slug: string
    country_slug: string
  }
}

type Props = {
  designers: Designer[]
}

const PX_PER_YEAR_OFFSET = 24

type BothRow = {
  kind: "both"
  designer: Designer
  anchorYear: number
}

type SplitRow = {
  kind: "split"
  mens?: Designer
  womens?: Designer
  anchorYear: number
}

type TimelineRow = BothRow | SplitRow

function sortedDesigners(designers: Designer[]): Designer[] {
  return [...designers].sort((a, b) => a.start_year - b.start_year)
}

function periodsOverlap(a: Designer, b: Designer): boolean {
  return a.start_year <= b.end_year && b.start_year <= a.end_year
}

function yearOffset(year: number, anchorYear: number) {
  return Math.max(0, year - anchorYear) * PX_PER_YEAR_OFFSET
}

function buildTimelineRows(designers: Designer[]): TimelineRow[] {
  const mens = sortedDesigners(designers.filter((d) => d.line === "mens"))
  const womens = sortedDesigners(designers.filter((d) => d.line === "womens"))
  const both = sortedDesigners(designers.filter((d) => d.line === "both"))

  const usedMens = new Set<number>()
  const usedWomens = new Set<number>()
  const splitRows: SplitRow[] = []

  for (const m of mens) {
    const match =
      womens.find(
        (w) => !usedWomens.has(w.id) && w.start_year === m.start_year,
      ) ??
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

  const bothRows: BothRow[] = both.map((designer) => ({
    kind: "both",
    designer,
    anchorYear: designer.start_year,
  }))

  return [...bothRows, ...splitRows].sort(
    (a, b) => a.anchorYear - b.anchorYear || a.kind.localeCompare(b.kind),
  )
}

function DesignerEntry({
  designer,
  showBothLabel = false,
  centered = false,
}: {
  designer: Designer
  showBothLabel?: boolean
  centered?: boolean
}) {
  const align = centered ? "text-center" : ""

  return (
    <div className={align}>
      <p
        className={`type-label text-[11px] tabular-nums ${align}`}
      >
        {designer.start_year}
        {" — "}
        {designer.end_year}
      </p>

      <Link
        href={`/designers/${designer.designers.region_slug}/${designer.designers.country_slug}/${designer.designer_slug}`}
        className="group mt-3 block"
      >
        <h3 className="type-display text-[1.75rem] text-foreground transition-colors group-hover:text-muted">
          {designer.designers.name}
        </h3>
        <p className="mt-1.5 text-sm tracking-[0.04em] text-muted">
          {designer.designers.name_ja}
        </p>
      </Link>

    </div>
  )
}

function ColumnDesignerEntry({ designer }: { designer: Designer }) {
  return (
    <div className="text-center">
      <DesignerEntry designer={designer} centered />
      <CollapsibleDescription
        description={designer.description}
        centered
      />
    </div>
  )
}

function SplitRowView({ row }: { row: SplitRow }) {
  return (
    <div className="grid grid-cols-1 items-start gap-12 md:grid-cols-2 md:gap-24">
      <div
        style={{
          paddingTop: row.mens
            ? yearOffset(row.mens.start_year, row.anchorYear)
            : 0,
        }}
      >
        {row.mens ? <ColumnDesignerEntry designer={row.mens} /> : null}
      </div>

      <div
        style={{
          paddingTop: row.womens
            ? yearOffset(row.womens.start_year, row.anchorYear)
            : 0,
        }}
      >
        {row.womens ? <ColumnDesignerEntry designer={row.womens} /> : null}
      </div>
    </div>
  )
}

export default function DesignerTimeline({ designers }: Props) {
  const withLine = designers.filter((d) => d.line != null)
  const hasLineData = withLine.length > 0

  if (!hasLineData) {
    return (
      <section className="mt-20">
        <SectionHeading title="Designers" titleJa="デザイナー" />
        <div className="mt-10 space-y-10">
          {sortedDesigners(designers).map((designer) => (
            <div key={designer.id}>
              <DesignerEntry designer={designer} />
              <CollapsibleDescription
                description={designer.description}
              />
            </div>
          ))}
        </div>
      </section>
    )
  }

  const rows = buildTimelineRows(withLine)

  return (
    <section className="mt-20">
      <SectionHeading title="Designers" titleJa="デザイナー" />

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
              <div key={`both-${row.designer.id}`} className="text-center">
                <DesignerEntry
                  designer={row.designer}
                  showBothLabel
                  centered
                />
                <CollapsibleDescription
                  description={row.designer.description}
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
