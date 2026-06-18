"use client"

import Link from "next/link"
import Image from "next/image"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import CollectionButton from "@/components/CollectionButton"
import DesignerTimeline from "@/components/DesignerTimeline"
import SectionHeading from "@/components/SectionHeading"
import RelatedBrandCard from "@/components/RelatedBrandCard"
import { useAuthModal } from "@/context/AuthModalContext"

type Brand = {
  id: string
  name: string
  name_ja: string | null
  slug: string
  brand_histories?: any[]
}

type RelatedBrand = {
  id: string
  name: string
  name_ja: string | null
  slug: string
  image_url: string | null
  region_slug: string
  country_slug: string
}

type Post = {
  id: string
  image_urls: string[]
  title: string | null
}

type BrandHistoryItem = {
  title: string
  content: string
  order: number
  type: 'text' | 'markdown' | 'html'
}

type Props = {
  brand: Brand
  relatedBrands: RelatedBrand[]
}

export default function BrandPageClient({ brand, relatedBrands }: Props) {
  const params = useParams()
  const slug = params.slug as string
  const { openAuthModal } = useAuthModal()
  const [designers, setDesigners] = useState<any[]>([])
  const [collections, setCollections] = useState<any[]>([])
  const [posts, setPosts] = useState<Post[]>([])
  const [historyItems, setHistoryItems] = useState<BrandHistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [isPlusMember, setIsPlusMember] = useState(false)
  const [following, setFollowing] = useState(false)
  const [followersCount, setFollowersCount] = useState(0)
  const [followLoading, setFollowLoading] = useState(false)

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setCurrentUserId(session.user.id)
        const { data: memberData } = await supabase
          .from("users")
          .select("plus_member")
          .eq("id", session.user.id)
          .single()
        setIsPlusMember(memberData?.plus_member || false)

        const { data: followStatus } = await supabase
          .from("brand_follows")
          .select("id")
          .eq("user_id", session.user.id)
          .eq("brand_slug", slug)
          .maybeSingle()
        setFollowing(!!followStatus)
      } else {
        setCurrentUserId(null)
        setIsPlusMember(false)
        setFollowing(false)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [slug])

  useEffect(() => {
    let isMounted = true

    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!isMounted) return

      if (user) {
        setCurrentUserId(user.id)
        const { data: memberData } = await supabase
          .from("users")
          .select("plus_member")
          .eq("id", user.id)
          .single()
        setIsPlusMember(memberData?.plus_member || false)
      }

      if (brand.brand_histories && brand.brand_histories.length > 0) {
        setHistoryItems(
          brand.brand_histories.map((item: any) => ({
            title: item.title || `${brand.name_ja || brand.name} について`,
            content: item.content || "",
            order: Number(item.order) || 0,
            type: 'markdown' as const
          }))
        )
      } else {
        setHistoryItems([])
      }

      const [designersRes, collectionsRes, postsRes, followCountRes, followStatusRes] = await Promise.all([
        supabase.from("brand_designers").select("*, designers (*)").eq("brand_slug", slug).order("start_year", { ascending: true }),
        supabase.from("collections").select("*").eq("brand_slug", slug).order("year", { ascending: true }),
        supabase.from("posts").select("id, image_urls, title").eq("brand_slug", slug).order("created_at", { ascending: false }),
        supabase.from("brand_follows").select("*", { count: "exact", head: true }).eq("brand_slug", slug),
        user ? supabase.from("brand_follows").select("id").eq("user_id", user.id).eq("brand_slug", slug).maybeSingle() : Promise.resolve({ data: null })
      ])

      if (isMounted) {
        setDesigners(designersRes.data || [])
        setCollections(collectionsRes.data || [])
        setPosts(postsRes.data || [])
        setFollowersCount(followCountRes.count || 0)
        setFollowing(!!followStatusRes.data)
        setLoading(false)
      }
    }

    fetchData()
    return () => { isMounted = false }
  }, [slug, brand.id])

  const handleFollow = async () => {
    if (!currentUserId || !isPlusMember) {
      openAuthModal()
      return
    }
    if (followLoading) return
    setFollowLoading(true)
    if (following) {
      await supabase.from("brand_follows").delete().eq("user_id", currentUserId).eq("brand_slug", slug)
      setFollowing(false)
      setFollowersCount((prev) => prev - 1)
    } else {
      await supabase.from("brand_follows").insert({ user_id: currentUserId, brand_slug: slug })
      setFollowing(true)
      setFollowersCount((prev) => prev + 1)
    }
    setFollowLoading(false)
  }

  if (loading) return <div className="text-sm text-subtle font-medium p-6">読み込み中...</div>

  return (
    <div>
      <div className="flex items-end justify-between gap-6 pb-6 border-b border-border/30 mb-20 sm:mb-24">
        <div className="space-y-1">
          <span className="text-[9px] tracking-[0.14em] text-subtle font-medium block leading-none">FOLLOWERS</span>
          <span className="text-xl sm:text-2xl font-light text-foreground mt-2 block leading-none tracking-wider tabular-nums">{followersCount}</span>
        </div>
        
        <button
          onClick={handleFollow}
          disabled={followLoading}
          className="border border-border/80 bg-surface rounded-xl px-5 py-2.5 text-xs sm:text-sm font-medium tracking-[0.02em] hover:bg-foreground hover:text-background transition-all duration-300 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed mb-[1px]"
        >
          {following ? "フォロー中" : "フォロー"}
        </button>
      </div>

      {historyItems.length > 0 && (
        <section className="mb-28 sm:mb-36 max-w-2xl mx-auto px-4 sm:px-0">
          <div className="text-center mb-10 sm:mb-12">
            <h2 className="type-brand text-lg sm:text-xl tracking-[0.2em] text-foreground uppercase leading-none font-medium">
              History
            </h2>
            <p className="text-[10px] tracking-[0.08em] text-subtle font-medium mt-2.5 leading-none">
              歴史
            </p>
          </div>
          
          <div className="space-y-10">
            {historyItems.map((item, index) => (
              <div key={index} className="space-y-4">
                {historyItems.length > 1 && (
                  <h3 className="text-center text-xs font-semibold tracking-[0.06em] text-foreground opacity-80 uppercase">
                    {item.title}
                  </h3>
                )}
                <p className="text-sm sm:text-[15px] text-foreground/80 leading-[2.2] tracking-wide font-normal text-justify whitespace-pre-wrap">
                  {item.content}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      <DesignerTimeline designers={designers} />

      <section className="mt-28 sm:mt-36">
        <SectionHeading title="Collections" titleJa="コレクション" className="mb-8" />
        <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2.5 sm:gap-3">
          {collections.map((collection) => (
            <CollectionButton key={collection.id} collection={collection} />
          ))}
        </div>
      </section>

      {relatedBrands.length > 0 && (
        <section className="mt-32 sm:mt-40">
          <SectionHeading title="Related Brands" titleJa="関連するブランド" className="mb-8" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
            {relatedBrands.map((rb) => (
              <RelatedBrandCard key={rb.id} brand={rb} />
            ))}
          </div>
        </section>
      )}

      <section className="mt-32 sm:mt-40 pb-16">
        <SectionHeading title="Posts" titleJa="投稿" className="mb-8" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-5 sm:gap-8">
          {posts.map((post) => {
            const urlSlug = `${slug || "archive"}-${post.id}`

            return (
              <Link key={post.id} href={`/posts/${urlSlug}`} className="block group">
                <article className="space-y-4">
                  <div className="relative w-full aspect-[4/5] overflow-hidden rounded-2xl border border-border">
                    {post.image_urls?.[0] && (
                      <Image 
                        src={post.image_urls[0]} 
                        alt={post.title || ""} 
                        fill
                        sizes="(max-width: 768px) 50vw, 33vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-105" 
                      />
                    )}
                  </div>
                  {post.title && (
                    <p className={`text-sm tracking-[0.02em] text-foreground truncate ${!isPlusMember ? "select-none pointer-events-none filter blur-[4px] opacity-60" : ""}`}>
                      {post.title}
                    </p>
                  )}
                </article>
              </Link>
            )
          })}
        </div>
      </section>
    </div>
  )
}