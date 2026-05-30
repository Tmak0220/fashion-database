"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import CollectionButton from "@/components/CollectionButton"
import DesignerTimeline from "@/components/DesignerTimeline"
import SectionHeading from "@/components/SectionHeading"
import Breadcrumb from "@/components/Breadcrumb"

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
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [isPlusMember, setIsPlusMember] = useState(false)
  const [following, setFollowing] = useState(false)
  const [followersCount, setFollowersCount] = useState(0)
  const [followLoading, setFollowLoading] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setCurrentUserId(user.id)
        const { data: memberData } = await supabase
          .from("users")
          .select("plus_member")
          .eq("id", user.id)
          .single()
        setIsPlusMember(memberData?.plus_member || false)
      }
      const { data: designersData } = await supabase
        .from("brand_designers")
        .select(`
          *,
          designers (*)
        `)
        .eq("brand_slug", slug)
        .order("start_year", { ascending: true })
      setDesigners(designersData || [])
      const { data: collectionsData } = await supabase
        .from("collections")
        .select("*")
        .eq("brand_slug", slug)
        .order("year", { ascending: true })
      setCollections(collectionsData || [])
      const { data: postsData } = await supabase
        .from("posts")
        .select("id, image_urls, title")
        .eq("brand_slug", slug)
        .order("created_at", { ascending: false })
      setPosts(postsData || [])
      const { count } = await supabase
        .from("brand_follows")
        .select("*", { count: "exact", head: true })
        .eq("brand_slug", slug)
      setFollowersCount(count || 0)
      if (user) {
        const { data: followData } = await supabase
          .from("brand_follows")
          .select("id")
          .eq("user_id", user.id)
          .eq("brand_slug", slug)
          .maybeSingle()
        setFollowing(!!followData)
      }
      setLoading(false)
    }
    fetchData()
  }, [slug])

  const handleFollow = async () => {
    if (!currentUserId) {
      alert("Login required")
      return
    }
    if (!isPlusMember) {
      alert("PLUS MEMBER限定機能です")
      return
    }
    if (followLoading) return
    setFollowLoading(true)
    if (following) {
      await supabase
        .from("brand_follows")
        .delete()
        .eq("user_id", currentUserId)
        .eq("brand_slug", slug)
      setFollowing(false)
      setFollowersCount((prev) => prev - 1)
    } else {
      await supabase
        .from("brand_follows")
        .insert({
          user_id: currentUserId,
          brand_slug: slug,
        })
      setFollowing(true)
      setFollowersCount((prev) => prev + 1)
    }
    setFollowLoading(false)
  }

  if (loading) {
    return <main className="p-6 sm:p-10 text-sm text-muted">Loading...</main>
  }

  return (
    <main className="p-6 sm:p-10 md:p-14 lg:p-16">
      <Breadcrumb
        items={[
          { label: "ファッションデータベース", href: "/" },
          { label: "ブランド", href: "/brands" },
          { label: brand.region_name_ja, href: `/brands/${brand.region_slug}` },
          { label: brand.country_name_ja, href: `/brands/${brand.region_slug}/${brand.country_slug}` },
          { label: brand.name_ja || brand.name },
        ]}
      />

      <div className="mt-8 sm:mt-10">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 sm:gap-8">
          <div>
            <h1 className={`type-brand text-4xl sm:text-5xl md:text-6xl ${brand.name.length <= 6 ? "tracking-[0.24em] pr-[0.24em]" : ""}`}>
              {brand.name}
            </h1>
            {brand.name_ja && (
              <p className="mt-3 text-lg sm:text-xl tracking-[0.04em] text-muted">
                {brand.name_ja}
              </p>
            )}
          </div>

          <div className="flex items-center gap-6 border-t md:border-t-0 pt-4 md:pt-0 border-border justify-between md:justify-end">
            <div>
              <p className="text-xs sm:text-sm text-subtle">Followers</p>
              <p className="mt-0.5 text-xl sm:text-2xl font-medium">{followersCount}</p>
            </div>
            <button
              onClick={handleFollow}
              disabled={followLoading}
              className="border border-border bg-surface rounded-xl px-4 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm tracking-[0.04em] hover:bg-black hover:text-white transition-colors duration-300"
            >
              {following ? "Following" : "Follow Brand"}
            </button>
          </div>
        </div>

        {brand.history && (
          <p className="mt-8 sm:mt-10 max-w-3xl text-[14px] sm:text-[15px] leading-7 sm:leading-8 text-muted whitespace-pre-line">
            {brand.history}
          </p>
        )}

        <DesignerTimeline designers={designers} />

        <section className="mt-12 sm:mt-16">
          <SectionHeading
            title="Collections"
            titleJa="コレクション"
            className="mb-6"
          />
          <div className="flex flex-wrap gap-2.5 sm:gap-4">
            {collections.map((collection) => (
              <CollectionButton
                key={collection.id}
                collection={collection}
              />
            ))}
          </div>
        </section>

        {relatedBrands.length > 0 && (
          <section className="mt-16 sm:mt-24">
            <SectionHeading
              title="Related Brands"
              titleJa="関連するブランド"
              className="mb-8"
            />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
              {relatedBrands.map((rb) => (
                <Link
                  key={rb.id}
                  href={`/brands/${rb.region_slug}/${rb.country_slug}/${rb.slug}`}
                  className="group block"
                >
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

        <section className="mt-16 sm:mt-24">
          <SectionHeading
            title="Posts"
            titleJa="投稿"
            className="mb-8"
          />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/posts/${post.id}`}
                className="block"
              >
                <article className="space-y-3">
                  <img
                    src={post.image_urls?.[0]}
                    alt=""
                    className="w-full aspect-[4/5] object-cover rounded-2xl border border-border"
                  />
                  {post.title && (
                    <p className="text-sm tracking-[0.02em] text-foreground truncate">
                      {post.title}
                    </p>
                  )}
                </article>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}