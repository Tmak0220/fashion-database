"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { supabase } from "@/lib/supabase"

type Post = {
  id: string
  title: string | null
  image_urls: string[]
  brand_slug: string | null
  season_slug: string | null
}

type Props = {
  season: string
  initialPosts: Post[]
}

export default function SeasonCollectionsPageClient({ season, initialPosts }: Props) {
  const [isPlusMember, setIsPlusMember] = useState(false)

  useEffect(() => {
    const checkMemberStatus = async (user: any) => {
      if (user) {
        const isAdmin = user?.user_metadata?.role === "admin" || user?.role === "admin" || user?.app_metadata?.role === "admin"
        const { data: memberData } = await supabase
          .from("users")
          .select("plus_member, plus_members, is_active")
          .eq("id", user.id)
          .maybeSingle()
        const hasValidFlag = memberData?.plus_member === true || memberData?.plus_members === true || memberData?.is_active === true
        setIsPlusMember(isAdmin || hasValidFlag)
      } else {
        setIsPlusMember(false)
      }
    }

    const initAuth = async () => {
      const { data: userResult } = await supabase.auth.getUser()
      await checkMemberStatus(userResult?.user)
    }

    initAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT") {
        setIsPlusMember(false)
      } else if (event === "SIGNED_IN" || event === "USER_UPDATED") {
        await checkMemberStatus(session?.user)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return (
    <main className="p-10 md:p-14 lg:p-16 max-w-7xl mx-auto w-full min-h-screen">
      <nav className="flex items-center gap-2 text-[10px] tracking-[0.15em] uppercase text-subtle mb-16">
        <Link href="/" className="hover:text-foreground transition-colors">
          HOME
        </Link>
        <span>/</span>
        <Link href="/collections" className="hover:text-foreground transition-colors">
          COLLECTIONS
        </Link>
        <span>/</span>
        <Link href="/collections/season" className="hover:text-foreground transition-colors">
          SEASON
        </Link>
        <span>/</span>
        <span className="text-muted font-medium uppercase">{season}</span>
      </nav>

      <section className="border-b border-border/40 pb-14">
        <div>
          <h1 className="type-display text-5xl md:text-6xl font-light text-foreground uppercase tracking-tight">
            {season.replace("-", " ")}
          </h1>
          <p className="text-[10px] tracking-[0.05em] text-subtle mt-2 font-normal">
            シーズン アーカイブ
          </p>
        </div>
      </section>

      {!isPlusMember && (
        <div className="fixed top-20 bottom-0 left-0 right-0 z-40 flex items-center justify-center p-4 bg-transparent pointer-events-auto">
          <div className="max-w-sm w-full h-fit p-6 sm:p-8 border border-border bg-white rounded-2xl shadow-2xl text-center">
            <h2 className="text-base font-semibold tracking-[0.05em] text-foreground">
              MEMBER限定コンテンツ
            </h2>
            <p className="mt-3 text-xs text-muted leading-relaxed">
              アーカイブの詳細や解説の閲覧、およびすべての機能を利用するにはMEMBER登録が必要です。
            </p>
            <Link
              href="/members"
              className="mt-6 block w-full text-center bg-black text-white font-medium rounded-xl px-4 py-3 text-[12px] transition-colors duration-300 hover:bg-neutral-800"
            >
              MEMBERに登録する
            </Link>
            <Link 
              href="/" 
              className="mt-4 inline-block text-[11px] text-subtle hover:text-foreground transition-colors duration-300"
            >
              トップページに戻る
            </Link>
          </div>
        </div>
      )}

      <section className="mt-20">
        <div className="flex items-end justify-between gap-6 mb-12 border-b border-border/40 pb-4">
          <div>
            <h2 className="type-display text-2xl font-light tracking-tight text-foreground uppercase">
              Season Archives
            </h2>
            <p className="text-[10px] tracking-[0.05em] text-subtle mt-1 font-normal">
              このシーズンの投稿アイテム
            </p>
          </div>
          <p className="text-[11px] tracking-widest text-subtle font-light uppercase">
            {initialPosts.length} Items
          </p>
        </div>

        {initialPosts.length === 0 ? (
          <div className="border border-border/50 rounded-2xl p-16 text-center text-xs tracking-wider text-subtle bg-surface/20">
            このシーズンの投稿はまだありません。
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
            {initialPosts.map((post) => {
              const content = (
                <article className="space-y-4">
                  <div className="relative overflow-hidden rounded-xl border border-border/40 bg-surface aspect-[4/5]">
                    {post.image_urls?.[0] && (
                      <Image
                        src={post.image_urls[0]}
                        alt={isPlusMember ? (post.title || "") : ""}
                        fill
                        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.025]"
                      />
                    )}
                  </div>
                  <div className="space-y-1 px-1">
                    {post.brand_slug && (
                      <span className={`text-[10px] font-semibold uppercase tracking-widest block transition-colors ${
                        isPlusMember ? "text-foreground group-hover:text-subtle" : "text-foreground"
                      }`}>
                        {post.brand_slug}
                      </span>
                    )}
                    {post.title && (
                      <p className={`text-[13px] font-normal tracking-wide text-muted line-clamp-1 ${
                        !isPlusMember ? "filter blur-[4px] select-none pointer-events-none" : ""
                      }`}>
                        {post.title}
                      </p>
                    )}
                  </div>
                </article>
              )

              return isPlusMember ? (
                <Link key={post.id} href={`/posts/${post.id}`} className="group block">
                  {content}
                </Link>
              ) : (
                <div key={post.id} className="block">
                  {content}
                </div>
              )
            })}
          </div>
        )}
      </section>
    </main>
  )
}