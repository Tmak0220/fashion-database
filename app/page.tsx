import type { Metadata } from "next"
import Link from "next/link"
import PostFeed from "@/components/PostFeed"

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Fashion Database",
    description: "ファッションコレクション、ランウェイ、ヴィンテージ、歴史的資料のための構造化アーカイブプロジェクト。",
  }
}

export default function Home() {
  return (
    <main className="min-h-screen">
      <section className="p-6 sm:p-10 md:p-14 lg:p-16">
        <div className="flex items-center justify-between gap-4 min-h-[40px]">
          <p className="type-label mt-0 text-[11px] text-subtle whitespace-nowrap">
            Archive Project
          </p>
          <Link
            href="/members"
            className="type-ui border border-border bg-surface px-4 sm:px-5 py-2 text-[11px] tracking-[0.12em] transition-colors duration-300 hover:border-foreground hover:bg-foreground hover:text-background whitespace-nowrap"
          >
            PLUS MEMBERS
          </Link>
        </div>

        <div className="mt-10 sm:mt-8 flex flex-col">
          <h1 className="type-display text-4xl sm:text-5xl md:text-6xl text-foreground break-words leading-tight">
            Fashion Database
          </h1>
          <p className="mt-2 text-sm sm:text-base md:text-lg tracking-[0.14em] text-muted font-medium">
            ファッションデータベース
          </p>
        </div>

        <p className="mt-8 max-w-2xl text-[14px] sm:text-[15px] leading-7 sm:leading-8 text-muted">
          ファッションコレクション、ランウェイ、ヴィンテージ、歴史的資料のための構造化アーカイブプロジェクト。
        </p>

        <nav className="mt-12 sm:mt-14 flex flex-wrap gap-3 sm:gap-4">
          <Link
            href="/brands"
            className="type-ui inline-block border border-border bg-surface px-5 md:px-8 py-3.5 text-[12px] sm:text-[13px] tracking-[0.1em] transition-colors duration-300 hover:border-foreground hover:bg-foreground hover:text-background"
          >
            BRANDS
          </Link>
          <Link
            href="/designers"
            className="type-ui inline-block border border-border bg-surface px-5 md:px-8 py-3.5 text-[12px] sm:text-[13px] tracking-[0.1em] transition-colors duration-300 hover:border-foreground hover:bg-foreground hover:text-background"
          >
            DESIGNERS
          </Link>
          <Link
            href="/collections"
            className="type-ui inline-block border border-border bg-surface px-5 md:px-8 py-3.5 text-[12px] sm:text-[13px] tracking-[0.1em] transition-colors duration-300 hover:border-foreground hover:bg-foreground hover:text-background"
          >
            COLLECTIONS
          </Link>
          <Link
            href="/tags"
            className="type-ui inline-block border border-border bg-surface px-5 md:px-8 py-3.5 text-[12px] sm:text-[13px] tracking-[0.1em] transition-colors duration-300 hover:border-foreground hover:bg-foreground hover:text-background"
          >
            TAGS
          </Link>
          <Link
            href="/groups"
            className="type-ui inline-block border border-border bg-surface px-5 md:px-8 py-3.5 text-[12px] sm:text-[13px] tracking-[0.1em] transition-colors duration-300 hover:border-foreground hover:bg-foreground hover:text-background"
          >
            GROUPS
          </Link>
        </nav>
      </section>

      <section className="px-6 pb-20 sm:px-10 md:px-14 lg:px-16">
        <div className="mb-8 sm:mb-12">
          <p className="type-label text-[11px] text-subtle tracking-[0.12em] pr-[0.12em]">
            Latest Posts
          </p>
        </div>
        <PostFeed />
      </section>
    </main>
  )
}