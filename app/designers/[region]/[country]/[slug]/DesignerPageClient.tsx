"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import CollectionButton from "@/components/CollectionButton"
import SectionHeading from "@/components/SectionHeading"
import Breadcrumb from "@/components/Breadcrumb"
import DesignerBrandTimeline from "@/components/DesignerBrandTimeline"

type Designer = {
  id: string
  slug: string
  name: string
  name_ja: string | null
  description: string | null
  region_slug: string
  region_name_ja: string
  country_slug: string
  country_name_ja: string
}

type Post = {
  id: string
  image_urls: string[]
  title: string | null
  brand_slug: string | null
}

type Props = {
  designer: Designer
  relatedDesigners: {
    id: string
    name: string
    name_ja: string | null
    slug: string
    region_slug: string
    country_slug: string
  }[]
}

export default function DesignerPageClient({ designer: initialDesigner }: Props) {
  const params = useParams()
  const slug = params.slug as string
  const [designer, setDesigner] = useState<Designer | null>(initialDesigner)
  const [collections, setCollections] = useState<any[]>([])
  const [brands, setBrands] = useState<any[]>([]) 
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

      const { data: designerData } = await supabase
        .from("designers")
        .select("*")
        .eq("slug", slug)
        .single()
      setDesigner(designerData)

      const { data: brandsData } = await supabase
        .from("brand_designers")
        .select(`*, brands (*)`)
        .eq("designer_slug", slug)
        .order("start_year", { ascending: true })
      setBrands(brandsData || []) 

      const { data: collectionsData } = await supabase
        .from("collections")
        .select("*")
        .eq("designer_slug", slug)
        .order("year", { ascending: true })
      setCollections(collectionsData || [])

      const { data: postsData } = await supabase
        .from("posts")
        .select(`id, image_urls, title, brand_slug`)
        .eq("designer_slug", slug)
        .order("created_at", { ascending: false })
      setPosts(postsData || [])

      const { count } = await supabase
        .from("designer_follows")
        .select("*", { count: "exact", head: true })
        .eq("designer_slug", slug)
      setFollowersCount(count || 0)

      if (user) {
        const { data: followData } = await supabase
          .from("designer_follows")
          .select("id")
          .eq("user_id", user.id)
          .eq("designer_slug", slug)
          .maybeSingle()
        setFollowing(!!followData)
      }
      setLoading(false)
    }

    fetchData()
  }, [slug])

  const handleFollow = async () => {
    if (!currentUserId) { alert("Login required"); return }
    if (!isPlusMember) { alert("PLUS MEMBER限定機能です"); return }
    if (followLoading) return
    setFollowLoading(true)

    if (following) {
      await supabase.from("designer_follows").delete().eq("user_id", currentUserId).eq("designer_slug", slug)
      setFollowing(false)
      setFollowersCount((prev) => prev - 1)
    } else {
      await supabase.from("designer_follows").insert({ user_id: currentUserId, designer_slug: slug })
      setFollowing(true)
      setFollowersCount((prev) => prev + 1)
    }
    setFollowLoading(false)
  }

  if (loading) return <main className="p-6 sm:p-10 text-sm text-muted">Loading...</main>
  if (!designer) return <main className="p-6 sm:p-10 text-sm text-muted">Designer not found</main>

  return (
    <main className="p-6 sm:p-10 md:p-14 lg:p-16">
      <Breadcrumb
        items={[
          { label: "ファッションデータベース", href: "/" },
          { label: "デザイナー", href: "/designers" },
          { label: designer.region_name_ja, href: `/designers/${designer.region_slug}` },
          { label: designer.country_name_ja, href: `/designers/${designer.region_slug}/${designer.country_slug}` },
          { label: designer.name_ja || designer.name },
        ]}
      />

      <div className="mt-8 sm:mt-10">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 sm:gap-8">
          <div>
            <h1 className={`type-brand text-4xl sm:text-5xl md:text-6xl ${designer.name.length <= 6 ? "tracking-[0.24em] pr-[0.24em]" : ""}`}>
              {designer.name}
            </h1>
            {designer.name_ja && (
              <p className="mt-3 text-lg sm:text-xl tracking-[0.04em] text-muted">
                {designer.name_ja}
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
              {following ? "Following" : "Follow Designer"}
            </button>
          </div>
        </div>

        {designer.description && (
          <p className="mt-8 sm:mt-10 max-w-3xl text-[14px] sm:text-[15px] leading-7 sm:leading-8 text-muted whitespace-pre-line">
            {designer.description}
          </p>
        )}

        <DesignerBrandTimeline brands={brands} />

        <section className="mt-12 sm:mt-16">
          <SectionHeading title="Collections" titleJa="コレクション" className="mb-6" />
          <div className="flex flex-wrap gap-2.5 sm:gap-4">
            {collections.map((collection) => (
              <CollectionButton key={collection.id} collection={collection} />
            ))}
          </div>
        </section>

        <section className="mt-16 sm:mt-24">
          <SectionHeading title="Posts" titleJa="投稿" className="mb-8" />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {posts.map((post) => {
              const urlSlug = `${post.brand_slug || "archive"}-${post.id}`

              return (
                <Link key={post.id} href={`/posts/${urlSlug}`} className="block">
                  <article className="space-y-3">
                    <img src={post.image_urls?.[0]} alt="" className="w-full aspect-[4/5] object-cover rounded-2xl border border-border" />
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
    </main>
  )
}