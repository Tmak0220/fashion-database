import type { Metadata } from "next"
import Link from "next/link"

import PostFeed from "@/components/PostFeed"
import CardSection from "@/components/CardSection"
import SectionHeading from "@/components/SectionHeading"

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Fashion Database",
    description:
      "ファッションコレクション、ランウェイ、ヴィンテージ、歴史的資料のための構造化アーカイブプロジェクト。",
  }
}

const navigationItems = [
  {
    id: "brands",
    name: "BRANDS",
    name_ja: "ブランド一覧",
    slug: "brands",
  },
  {
    id: "designers",
    name: "DESIGNERS",
    name_ja: "デザイナー一覧",
    slug: "designers",
  },
  {
    id: "collections",
    name: "COLLECTIONS",
    name_ja: "コレクション一覧",
    slug: "collections",
  },
  {
    id: "tags",
    name: "TAGS",
    name_ja: "タグ検索",
    slug: "tags",
  },
  {
    id: "groups",
    name: "GROUPS",
    name_ja: "ブランドグループ",
    slug: "groups",
  },
]

export default function Home() {
  return (
    <main className="min-h-screen">
      <section className="p-6 sm:p-10 md:p-14 lg:p-16">
        <div className="flex items-center justify-between gap-4 min-h-[40px]">
          <p className="type-label mt-0 text-[11px] text-subtle whitespace-nowrap">
            Fashion Archive
          </p>

          <Link
            href="/members"
            className="
              type-ui
              border
              border-border
              rounded-xl
              bg-surface
              px-4
              sm:px-5
              py-2
              text-[11px]
              transition-all
              duration-300
              hover:border-foreground/30
              hover:bg-foreground/[0.02]
              hover:-translate-y-[1px]
            "
          >
            Members
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

        <p className="mt-8 max-w-xl text-[14px] sm:text-[15px] leading-7 sm:leading-8 text-muted">
          ファッションコレクション、ブランド、デザイナー、歴史資料を記録するアーカイブプロジェクトです。
        </p>

        <CardSection
          items={navigationItems}
          basePath=""
          variant="navigation"
          showHeading={false}
        />
      </section>

      <section className="px-6 pb-20 pt-6 sm:px-10 md:px-14 lg:px-16">
        <SectionHeading
          title="Latest Posts"
          titleJa="最新投稿"
          className="mb-8"
        />

        <PostFeed />
      </section>
    </main>
  )
}