"use client"

import Link from "next/link"
import Image from "next/image"

type Post = {
  id: string
  image_urls: string[]
  title: string | null
}

type Props = {
  brandSlug: string
  seasonSlug: string
  initialPosts: Post[]
}

export default function CollectionPageClient({ brandSlug, seasonSlug, initialPosts }: Props) {
  const displayTitle = `${brandSlug} ${seasonSlug}`

  return (
    <main className="p-10 md:p-14 lg:p-16 max-w-7xl mx-auto w-full">
      <nav className="flex items-center gap-2 text-[10px] tracking-[0.15em] uppercase text-subtle mb-16">
        <Link href="/" className="hover:text-foreground transition-colors">
          HOME
        </Link>
        <span>/</span>
        <Link href="/collections" className="hover:text-foreground transition-colors">
          COLLECTIONS
        </Link>
        <span>/</span>
        <Link href={`/collections/${brandSlug}`} className="hover:text-foreground transition-colors uppercase">
          {brandSlug}
        </Link>
        <span>/</span>
        <span className="text-muted font-medium uppercase">{seasonSlug}</span>
      </nav>

      <section className="border-b border-border/40 pb-14">
        <div>
          <h1 className="type-display text-5xl md:text-6xl font-light text-foreground uppercase tracking-tight">
            {displayTitle}
          </h1>
          <p className="text-[10px] tracking-[0.05em] text-subtle mt-2 font-normal">
            コレクション アーカイブ
          </p>
        </div>
      </section>

      <section className="mt-20">
        <div className="flex items-end justify-between gap-6 mb-12 border-b border-border/40 pb-4">
          <div>
            <h2 className="type-display text-2xl font-light tracking-tight text-foreground uppercase">
              Related Archives
            </h2>
            <p className="text-[10px] tracking-[0.05em] text-subtle mt-1 font-normal">
              関連する投稿アイテム
            </p>
          </div>
          <p className="text-[11px] tracking-widest text-subtle font-light uppercase">
            {initialPosts.length} Items
          </p>
        </div>

        {initialPosts.length === 0 ? (
          <div className="border border-border/50 rounded-2xl p-16 text-center text-xs tracking-wider text-subtle bg-surface/20">
            このコレクションの投稿はまだありません。
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
            {initialPosts.map((post) => (
              <Link key={post.id} href={`/posts/${post.id}`} className="group block">
                <article className="space-y-4">
                  <div className="relative overflow-hidden rounded-xl border border-border/40 bg-surface aspect-[4/5]">
                    {post.image_urls?.[0] && (
                      <Image
                        src={post.image_urls[0]}
                        alt={post.title || ""}
                        fill
                        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.025]"
                      />
                    )}
                  </div>
                  <div className="space-y-1 px-1">
                    <span className="text-[10px] font-medium uppercase tracking-widest text-subtle block">
                      {seasonSlug.replace("-", " ")}
                    </span>
                    {post.title && (
                      <p className="text-[13px] font-normal tracking-wide text-foreground line-clamp-1 group-hover:text-subtle transition-colors">
                        {post.title}
                      </p>
                    )}
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}