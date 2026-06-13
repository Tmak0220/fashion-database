"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import CollectionButton from "@/components/CollectionButton"
import DesignerTimeline from "@/components/DesignerTimeline"
import SectionHeading from "@/components/SectionHeading"
import HistoryDrawerItem from "@/components/HistoryDrawerItem"

type Brand = {
  id: string
  name: string
  name_ja: string | null
  history: string | null
  slug: string
  region_slug: string
  country_slug: string
  region_name_ja: string
  country_name_ja: string
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
      } else if (brand.history) {
        setHistoryItems([{
          title: `${brand.name_ja || brand.name} について`,
          content: brand.history,
          order: 1,
          type: 'text' as const
        }])
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
  }, [slug, brand])

  const handleFollow = async () => {
    if (!currentUserId) { alert("Login required"); return }
    if (!isPlusMember) { alert("PLUS MEMBER限定機能です"); return }
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

  if (loading) return <div className="text-sm text-muted font-medium">読み込み中...</div>

  return (
    <div>
      <div className="flex items-center justify-between gap-6 pb-8 border-b border-border/60 mb-10">
        <div>
          <p className="text-[11px] tracking-[0.12em] text-subtle uppercase font-medium">Followers</p>
          <p className="mt-1 text-xl sm:text-2xl font-semibold leading-none">{followersCount}</p>
        </div>
        <button
          onClick={handleFollow}
          disabled={followLoading}
          className="border border-border bg-surface rounded-xl px-5 py-3 text-xs sm:text-sm font-medium tracking-[0.04em] hover:bg-black hover:text-white transition-colors duration-300"
        >
          {following ? "フォロー中" : "ブランドをフォロー"}
        </button>
      </div>

      {historyItems.length > 0 && (
        <div className="mb-16 space-y-4 max-w-2xl mx-auto">
          {historyItems.map((item, index) => (
            <HistoryDrawerItem key={index} title={item.title} content={item.content} />
          ))}
        </div>
      )}

      <DesignerTimeline designers={designers} />

      <section className="mt-12 sm:mt-16">
        <SectionHeading title="Collections" titleJa="コレクション" className="mb-6" />
        <div className="flex flex-wrap gap-2.5 sm:gap-4">
          {collections.map((collection) => (
            <CollectionButton key={collection.id} collection={collection} />
          ))}
        </div>
      </section>

      {relatedBrands.length > 0 && (
        <section className="mt-16 sm:mt-24">
          <SectionHeading title="Related Brands" titleJa="関連するブランド" className="mb-8" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
            {relatedBrands.map((rb) => (
              <Link key={rb.id} href={`/brands/${rb.region_slug}/${rb.country_slug}/${rb.slug}`} className="group block">
                <div className="w-full aspect-[4/3] border border-border bg-surface rounded-xl flex flex-col items-center justify-center p-3 sm:p-4 text-center transition-all duration-300 md:group-hover:bg-black md:group-hover:text-white md:group-hover:border-black active:bg-neutral-100">
                  <p className="text-xs sm:text-sm md:text-base font-semibold tracking-[0.06em] uppercase truncate w-full text-foreground group-hover:text-inherit">
                    {rb.name}
                  </p>
                  {rb.name_ja && (
                    <p className="text-[10px] sm:text-xs tracking-[0.02em] mt-1 sm:mt-1.5 text-muted group-hover:text-inherit opacity-80 truncate w-full">
                      {rb.name_ja}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mt-16 sm:mt-24 pb-14">
        <SectionHeading title="Posts" titleJa="投稿" className="mb-8" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          {posts.map((post) => (
            <Link key={post.id} href={`/posts/${post.id}`} className="block">
              <article className="space-y-3">
                <img src={post.image_urls?.[0]} alt="" className="w-full aspect-[4/5] object-cover rounded-2xl border border-border" />
                {post.title && (
                  <p className={`text-sm tracking-[0.02em] text-foreground truncate ${!isPlusMember ? "select-none pointer-events-none filter blur-[4px] opacity-60" : ""}`}>
                    {post.title}
                  </p>
                )}
              </article>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}