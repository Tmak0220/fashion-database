"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
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

type BothRow = { kind: "both"; designer: Designer; anchorYear: number }
type SplitRow = { kind: "split"; mens?: Designer; womens?: Designer; anchorYear: number }
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
  centered = false,
  onOpenDrawer,
}: {
  designer: Designer
  centered?: boolean
  onOpenDrawer: (designer: Designer) => void
}) {
  const align = centered ? "text-center flex flex-col items-center" : "flex flex-col items-start"

  return (
    <div className={align}>
      <p className="type-label text-[11px] tabular-nums text-subtle">
        {designer.start_year}
        {" — "}
        {designer.end_year}
      </p>

      <Link
        href={`/designers/${designer.designers.region_slug}/${designer.designers.country_slug}/${designer.designer_slug}`}
        className="group mt-2 block"
      >
        <h3 className="type-display text-2xl sm:text-[1.75rem] text-foreground transition-colors group-hover:text-muted">
          {designer.designers.name}
        </h3>
        <p className="mt-1 text-[13px] tracking-[0.04em] text-muted">
          {designer.designers.name_ja}
        </p>
      </Link>

      {designer.description && (
        <button
          onClick={() => onOpenDrawer(designer)}
          className="mt-4 group flex items-center gap-2 pb-0.5 border-b border-border/40 hover:border-foreground transition-colors duration-300"
        >
          <span className="text-[10px] uppercase tracking-[0.1em] text-muted group-hover:text-foreground transition-colors">
            経歴を読む
          </span>
          <svg className="w-3 h-3 text-muted group-hover:text-foreground transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </button>
      )}
    </div>
  )
}

function DesignerDrawer({
  designer,
  isOpen,
  onClose,
}: {
  designer: Designer | null
  isOpen: boolean
  onClose: () => void
}) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [onClose])

  if (!designer) return null

  return (
    <div
      className={`fixed inset-0 z-50 transition-all duration-500 ${
        isOpen ? "opacity-100 visible" : "opacity-0 invisible"
      }`}
    >
      <div
        className={`absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity duration-500 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      <div
        className={`absolute right-0 top-0 bottom-0 w-full sm:w-[440px] md:w-[500px] bg-surface shadow-2xl border-l border-border transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-border/40">
          <span className="text-[10px] uppercase tracking-[0.15em] text-subtle font-medium">
            Designer Biography
          </span>
          <button
            onClick={onClose}
            className="p-2 -mr-2 text-muted hover:text-foreground transition-transform hover:rotate-90 duration-300"
            aria-label="Close panel"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-8 md:px-10 md:py-12 custom-scrollbar">
          <p className="text-xs tabular-nums text-muted mb-4 tracking-widest">
            {designer.start_year} — {designer.end_year}
          </p>
          <h2 className="text-3xl md:text-4xl font-light text-foreground leading-tight">
            {designer.designers.name}
          </h2>
          <p className="mt-2 text-sm tracking-[0.04em] text-muted">
            {designer.designers.name_ja}
          </p>

          <div className="mt-12 w-8 h-px bg-border/80" />

          <div className="mt-10 text-[13px] md:text-sm leading-[2] tracking-[0.02em] text-foreground/80 whitespace-pre-wrap">
            {designer.description}
          </div>
        </div>

        <div className="p-6 border-t border-border/40 bg-surface/50">
          <Link
            href={`/designers/${designer.designers.region_slug}/${designer.designers.country_slug}/${designer.designer_slug}`}
            onClick={onClose}
            className="block w-full text-center py-3.5 bg-foreground text-background text-xs tracking-[0.08em] uppercase font-medium hover:bg-muted transition-colors duration-300"
          >
            View Full Profile
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function DesignerTimeline({ designers }: Props) {
  const [selectedDesigner, setSelectedDesigner] = useState<Designer | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const handleOpenDrawer = (designer: Designer) => {
    setSelectedDesigner(designer)
    setIsDrawerOpen(true)
  }

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false)
    setTimeout(() => setSelectedDesigner(null), 500)
  }

  const withLine = designers.filter((d) => d.line != null)
  const hasLineData = withLine.length > 0

  if (!hasLineData) {
    return (
      <section className="mt-20">
        <SectionHeading title="Designers" titleJa="デザイナー" />
        <div className="mt-10 space-y-12">
          {sortedDesigners(designers).map((designer) => (
            <DesignerEntry
              key={designer.id}
              designer={designer}
              onOpenDrawer={handleOpenDrawer}
            />
          ))}
        </div>
        <DesignerDrawer
          designer={selectedDesigner}
          isOpen={isDrawerOpen}
          onClose={handleCloseDrawer}
        />
      </section>
    )
  }

  const rows = buildTimelineRows(withLine)

  return (
    <section className="mt-20">
      <SectionHeading title="Designers" titleJa="デザイナー" />

      <div className="mt-10 grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-24">
        <h3 className="text-center text-[10px] tracking-[0.15em] uppercase text-muted font-medium border-b border-border/40 pb-3">
          Menswear
        </h3>
        <h3 className="text-center text-[10px] tracking-[0.15em] uppercase text-muted font-medium border-b border-border/40 pb-3">
          Womenswear
        </h3>
      </div>

      <div className="mt-8 flex flex-col gap-12">
        {rows.map((row) => {
          if (row.kind === "both") {
            return (
              <div key={`both-${row.designer.id}`} className="text-center">
                <DesignerEntry
                  designer={row.designer}
                  centered
                  onOpenDrawer={handleOpenDrawer}
                />
              </div>
            )
          }

          return (
            <div
              key={`split-${row.mens?.id ?? "m"}-${row.womens?.id ?? "w"}`}
              className="grid grid-cols-1 items-start gap-12 md:grid-cols-2 md:gap-24"
            >
              <div style={{ paddingTop: row.mens ? yearOffset(row.mens.start_year, row.anchorYear) : 0 }}>
                {row.mens && (
                  <DesignerEntry
                    designer={row.mens}
                    centered
                    onOpenDrawer={handleOpenDrawer}
                  />
                )}
              </div>
              <div style={{ paddingTop: row.womens ? yearOffset(row.womens.start_year, row.anchorYear) : 0 }}>
                {row.womens && (
                  <DesignerEntry
                    designer={row.womens}
                    centered
                    onOpenDrawer={handleOpenDrawer}
                  />
                )}
              </div>
            </div>
          )
        })}
      </div>

      <DesignerDrawer
        designer={selectedDesigner}
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
      />
    </section>
  )
}