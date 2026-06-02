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

        <nav className="mt-12 sm:mt-14 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          <Link
            href="/brands"
            className="group min-w-[180px] text-center border border-border bg-surface px-5 md:px-8 py-3.5 transition-colors duration-300 hover:border-foreground hover:bg-foreground hover:text-background"
          >
            <p className="type-label text-sm tracking-[0.08em] font-semibold uppercase group-hover:text-inherit">
              BRANDS
            </p>
            <p className="mt-1 text-xs text-muted group-hover:text-inherit opacity-80">
              ブランド一覧
            </p>
          </Link>

          <Link
            href="/designers"
            className="group min-w-[180px] text-center border border-border bg-surface px-5 md:px-8 py-3.5 transition-colors duration-300 hover:border-foreground hover:bg-foreground hover:text-background"
          >
            <p className="type-label text-sm tracking-[0.08em] font-semibold uppercase group-hover:text-inherit">
              DESIGNERS
            </p>
            <p className="mt-1 text-xs text-muted group-hover:text-inherit opacity-80">
              デザイナー一覧
            </p>
          </Link>

          <Link
            href="/collections"
            className="group min-w-[180px] text-center border border-border bg-surface px-5 md:px-8 py-3.5 transition-colors duration-300 hover:border-foreground hover:bg-foreground hover:text-background"
          >
            <p className="type-label text-sm tracking-[0.08em] font-semibold uppercase group-hover:text-inherit">
              COLLECTIONS
            </p>
            <p className="mt-1 text-xs text-muted group-hover:text-inherit opacity-80">
              コレクション一覧
            </p>
          </Link>

          <Link
            href="/tags"
            className="group min-w-[180px] text-center border border-border bg-surface px-5 md:px-8 py-3.5 transition-colors duration-300 hover:border-foreground hover:bg-foreground hover:text-background"
          >
            <p className="type-label text-sm tracking-[0.08em] font-semibold uppercase group-hover:text-inherit">
              TAGS
            </p>
            <p className="mt-1 text-xs text-muted group-hover:text-inherit opacity-80">
              タグ検索
            </p>
          </Link>

          <Link
            href="/groups"
            className="group min-w-[180px] text-center border border-border bg-surface px-5 md:px-8 py-3.5 transition-colors duration-300 hover:border-foreground hover:bg-foreground hover:text-background"
          >
            <p className="type-label text-sm tracking-[0.08em] font-semibold uppercase group-hover:text-inherit">
              GROUPS
            </p>
            <p className="mt-1 text-xs text-muted group-hover:text-inherit opacity-80">
              ブランドグループ
            </p>
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