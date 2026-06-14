export const dynamic = "force-dynamic"

import type { Metadata } from "next"
import Link from "next/link"
import PostFeed from "@/components/PostFeed"
import CardSection from "@/components/CardSection"
import SectionHeading from "@/components/SectionHeading"

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Fashion Database",
    description: "ファッションコレクション、ランウェイ、ヴィンテージ、歴史的資料のための構造化アーカイブプロジェクト。",
  }
}

const navigationItems = [
  { id: "brands", name: "BRANDS", name_ja: "ブランド一覧", slug: "brands" },
  { id: "designers", name: "DESIGNERS", name_ja: "デザイナー一覧", slug: "designers" },
  { id: "collections", name: "COLLECTIONS", name_ja: "コレクション一覧", slug: "collections" },
  { id: "tags", name: "TAGS", name_ja: "タグ検索", slug: "tags" },
  { id: "groups", name: "GROUPS", name_ja: "ブランドグループ", slug: "groups" },
]

export default function Home() {
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
            ファッションデータベース
          </p>
        </div>
      </section>

      <section className="px-6 mt-16 mb-28 sm:px-10 sm:mt-24 sm:mb-32 md:px-14 md:mt-28 md:mb-36 lg:px-16">
        <div className="w-full bg-white/[0.2] backdrop-blur-[8px] rounded-3xl px-6 pt-5 pb-8 sm:px-8 sm:pt-6 sm:pb-9 md:px-10 md:pt-7 md:pb-10 shadow-[0_8px_32px_0_rgba(0,0,0,0.01)] border border-white/[0.2]">
          <div className="-mt-9 sm:-mt-10 md:-mt-11">
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