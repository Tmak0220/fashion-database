export const dynamic = "force-dynamic"

import type { Metadata } from "next"
import Link from "@/components/LocalizedLink"
import PostFeed from "@/components/PostFeed"
import CardSection from "@/components/CardSection"
import SectionHeading from "@/components/SectionHeading"
import { getRequestLocale, localizedAlternates } from "@/lib/locale-server"
import { translateText } from "@/lib/i18n"

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale()
  return {
    title: locale === "en" ? "FASHION DATABASE - Fashion Archive" : "FASHION DATABASE - ファッションデータベース",
    description: locale === "en"
      ? "A structured archive for fashion collections, runway, vintage pieces, and historical references."
      : "ファッションコレクション、ランウェイ、ヴィンテージ、歴史的資料のための構造化アーカイブプロジェクト。",
    alternates: await localizedAlternates("/"),
  }
}

const navigationItems = [
  { id: "brands", name: "BRANDS", name_ja: "ブランド一覧", slug: "brands" },
  { id: "designers", name: "DESIGNERS", name_ja: "デザイナー一覧", slug: "designers" },
  { id: "collections", name: "COLLECTIONS", name_ja: "コレクション一覧", slug: "collections" },
  { id: "tags", name: "TAGS", name_ja: "タグ検索", slug: "tags" },
  { id: "groups", name: "GROUPS", name_ja: "ブランドグループ", slug: "groups" },
]

export default async function Home() {
  const locale = await getRequestLocale()
  const t = (text: string) => translateText(text, locale)

  return (
    <main className="min-h-screen">
      <section className="p-6 sm:p-10 md:p-14 lg:p-16 pb-0 sm:pb-0 md:pb-0 lg:pb-0">
        <div className="flex items-center justify-between gap-4 min-h-[40px]">
          <p className="type-label mt-0 text-[11px] text-subtle whitespace-nowrap">
            Archive Project
          </p>
          <Link
            href="/members"
            className="type-ui border border-border rounded-xl bg-surface px-4 sm:px-5 py-2 text-[11px] transition-all duration-300 hover:border-foreground/30 hover:bg-foreground/[0.02] hover:-translate-y-[1px]"
          >
            MEMBERSHIP
          </Link>
        </div>

        <div className="mt-8 sm:mt-10 flex flex-col">
          <h1 className="type-display text-4xl sm:text-5xl md:text-6xl text-foreground break-words leading-tight">
            Fashion Database
          </h1>
          <p className="mt-2 text-sm sm:text-base md:text-lg tracking-[0.08em] text-muted">
            {t("ファッションデータベース")}
          </p>
        </div>
      </section>

      <section className="px-6 mt-16 mb-28 sm:px-10 sm:mt-24 sm:mb-32 md:px-14 md:mt-28 md:mb-36 lg:px-16">
        <div className="relative w-full overflow-hidden rounded-3xl border border-white/50 bg-white/25 p-4 shadow-[0_18px_60px_rgba(40,32,24,0.035)] backdrop-blur-xl sm:p-6 md:p-8">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.72),rgba(255,255,255,0.12)_44%,transparent_72%)]" />
          <div className="relative mb-5 flex items-center gap-5 px-1 sm:mb-6">
            <div className="shrink-0">
              <p className="type-label text-[10px] !text-foreground/60 sm:text-[11px]">Explore the archive</p>
              <p className="mt-1 text-[11px] tracking-[0.06em] text-muted">アーカイブから探す</p>
            </div>
            <div className="h-px flex-1 bg-border/70" />
          </div>
          <div className="relative">
            <CardSection
              items={navigationItems}
              basePath=""
              variant="navigation"
              showHeading={false}
            />
          </div>
        </div>
      </section>

      <section className="px-6 pb-20 sm:px-10 md:px-14 lg:px-16">
        <SectionHeading
          title="Latest Posts"
          titleJa="最新投稿"
          className="mb-8 [&_h2]:text-2xl [&_h2]:sm:text-3xl [&_h2]:md:text-4xl [&_h2]:font-normal [&_p]:text-xs [&_p]:sm:text-sm [&_p]:tracking-[0.08em] [&_p]:mt-1.5"
        />
        <PostFeed />
      </section>
    </main>
  )
}
