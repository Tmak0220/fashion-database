"use client"

import { useEffect, useState } from "react"
import Link from "@/components/LocalizedLink"
import Image from "next/image"
import { supabase } from "@/lib/supabase"
import PostLoading from "./loading"
import AutoTranslatedText from "@/components/AutoTranslatedText"
import { useLocale } from "@/context/LocaleContext"
import { useAuthModal } from "@/context/AuthModalContext"

type RelatedPost = {
  id: string
  title: string | null
  image_urls: string[]
  brands: { slug: string } | null
}

type Post = {
  id: string
  title: string | null
  description: string | null
  image_urls: string[]
  created_at: string
  user_id: string
  brand_id: number | null
  designer_id: number | null
  collection_id: number | null
  year: number | null
  season: string | null
  users: {
    id: string
    username: string | null
    display_name: string | null
    avatar_url: string | null
  } | null
  brands: {
    slug: string
    name: string
    regions: { slug: string }
    countries: { slug: string }
  } | null
  designers: {
    slug: string
    name: string
    regions: { slug: string }
    countries: { slug: string }
  } | null
  post_tags: {
    tags: {
      slug: string
      name: string
    }
  }[]
}

type Props = {
  id: string
}

export default function PostPageClient({ id }: Props) {
  const { localizePath } = useLocale()
  const { openAuthModal } = useAuthModal()
  const [post, setPost] = useState<Post | null>(null)
  const [relatedPosts, setRelatedPosts] = useState<RelatedPost[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [following, setFollowing] = useState(false)
  const [likeLoading, setLikeLoading] = useState(false)
  const [followLoading, setFollowLoading] = useState(false)
  const [bookmarked, setBookmarked] = useState(false)
  const [bookmarkLoading, setBookmarkLoading] = useState(false)

  useEffect(() => {
    const fetchPost = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      const userId = user?.id || null

      if (user) {
        setCurrentUserId(userId)
      }

      const { data: rawPost, error } = await supabase
        .from("posts")
        .select(`
          *,
          users:profiles!posts_user_id_fkey (id, username, display_name, avatar_url),
          post_tags (tags (slug, name))
        `)
        .eq("id", id)
        .single()

      if (error || !rawPost) {
        console.error("投稿の取得失敗:", error)
        setLoading(false)
        return
      }

      let brandData = null
      if (rawPost.brand_id) {
        const { data } = await supabase
          .from("brands")
          .select("slug, name, regions(slug), countries(slug)")
          .eq("id", rawPost.brand_id)
          .maybeSingle()
        brandData = data
      }

      let designerData = null
      if (rawPost.designer_id) {
        const { data } = await supabase
          .from("designers")
          .select("slug, name, regions(slug), countries(slug)")
          .eq("id", rawPost.designer_id)
          .maybeSingle()
        designerData = data
      }

      const combinedPost = {
        ...rawPost,
        brands: brandData,
        designers: designerData
      } as Post

      setPost(combinedPost)

      const slugPrefix = combinedPost.brands?.slug || "archive"
      const expectedPath = localizePath(`/posts/${slugPrefix}-${id}`)
      if (window.location.pathname !== expectedPath) {
        window.history.replaceState(null, "", expectedPath)
      }

      let sameBrandFetched: RelatedPost[] = []
      let otherBrandFetched: RelatedPost[] = []

      if (rawPost.brand_id) {
        const query = supabase
          .from("posts")
          .select("id, title, image_urls, brands!posts_brand_id_fkey(slug)")
          .eq("brand_id", rawPost.brand_id)
          .neq("id", id)
        
        const relatedBrandQuery = userId ? query.neq("user_id", userId) : query
        const { data: bPosts, error: sameBrandError } = await relatedBrandQuery.limit(10)
        if (sameBrandError) console.error("Failed to load related brand posts", sameBrandError)
        if (bPosts && bPosts.length > 0) {
          sameBrandFetched = bPosts.map((item) => ({
            ...item,
            brands: Array.isArray(item.brands) ? item.brands[0] || null : item.brands,
          })).sort(() => 0.5 - Math.random()).slice(0, 2)
        }
      }

      const excludedIds = [id, ...sameBrandFetched.map(p => p.id)]
      let otherQuery = supabase
        .from("posts")
        .select("id, title, image_urls, brands!posts_brand_id_fkey(slug)")
        .not("id", "in", `(${excludedIds.join(",")})`)
      
      if (rawPost.brand_id) otherQuery = otherQuery.neq("brand_id", rawPost.brand_id)
      if (userId) otherQuery = otherQuery.neq("user_id", userId)
      const { data: oPosts, error: otherPostsError } = await otherQuery.limit(20)
      if (otherPostsError) console.error("Failed to load other related posts", otherPostsError)
      if (oPosts && oPosts.length > 0) {
        const neededOtherCount = 4 - sameBrandFetched.length
        otherBrandFetched = oPosts.map((item) => ({
          ...item,
          brands: Array.isArray(item.brands) ? item.brands[0] || null : item.brands,
        })).sort(() => 0.5 - Math.random()).slice(0, neededOtherCount)
      }

      const finalRelated = [...sameBrandFetched, ...otherBrandFetched].sort(() => 0.5 - Math.random())
      setRelatedPosts(finalRelated)

      const { count } = await supabase
        .from("likes")
        .select("*", { count: "exact", head: true })
        .eq("post_id", id)
      setLikeCount(count || 0)

      if (user) {
        const { data: likedData } = await supabase.from("likes").select("id").eq("post_id", id).eq("user_id", user.id).maybeSingle()
        setLiked(!!likedData)

        if (rawPost.users?.id) {
          const { data: followDataCorrect } = await supabase.from("follows").select("id").eq("follower_id", user.id).eq("following_id", rawPost.users.id).maybeSingle()
          setFollowing(!!followDataCorrect)
        }

        const { data: bookmarkData } = await supabase.from("bookmarks").select("id").eq("post_id", id).eq("user_id", user.id).maybeSingle()
        setBookmarked(!!bookmarkData)
      }

      setLoading(false)
    }

    fetchPost()
  }, [id, localizePath])
  
  const requireAuth = () => {
    if (!currentUserId) {
      openAuthModal()
      return false
    }
    return true
  }

  const handleLike = async () => {
    if (!requireAuth() || !currentUserId || likeLoading) return
    setLikeLoading(true)

    if (liked) {
      await supabase.from("likes").delete().eq("post_id", id).eq("user_id", currentUserId)
      setLiked(false)
      setLikeCount((prev) => prev - 1)
    } else {
      await supabase.from("likes").insert({ post_id: id, user_id: currentUserId })
      setLiked(true)
      setLikeCount((prev) => prev + 1)
    }
    setLikeLoading(false)
  }

  const handleFollow = async () => {
    if (!requireAuth() || !currentUserId || !post?.users?.id || followLoading) return
    setFollowLoading(true)

    if (following) {
      await supabase.from("follows").delete().eq("follower_id", currentUserId).eq("following_id", post.users.id)
      setFollowing(false)
    } else {
      await supabase.from("follows").insert({ follower_id: currentUserId, following_id: post.users.id })
      setFollowing(true)
    }
    setFollowLoading(false)
  }

  const handleBookmark = async () => {
    if (!requireAuth() || !currentUserId || bookmarkLoading) return
    setBookmarkLoading(true)

    if (bookmarked) {
      const { error } = await supabase
        .from("bookmarks")
        .delete()
        .eq("post_id", id)
        .eq("user_id", currentUserId)

      if (error) {
        console.error("Bookmark deletion failed:", error.message)
      } else {
        setBookmarked(false)
      }
    } else {
      const { error } = await supabase
        .from("bookmarks")
        .insert({ post_id: id, user_id: currentUserId })

      if (error) {
        console.error("Bookmark insertion failed:", error.message)
      } else {
        setBookmarked(true)
      }
    }
    setBookmarkLoading(false)
  }

  if (loading) {
    return <PostLoading />
  }

  if (!post) {
    return <main className="max-w-[1280px] mx-auto px-[clamp(1.5rem,4vw,4rem)] py-[clamp(2rem,5vw,4rem)] text-center text-sm text-muted">投稿が見つかりませんでした</main>
  }

  const isOwnPost = currentUserId === post.user_id

  return (
    <main className="max-w-[1280px] mx-auto px-[clamp(1.5rem,4vw,4rem)] py-[clamp(2rem,5vw,4rem)] space-y-[clamp(4rem,8vw,6rem)]">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[clamp(2rem,4vw,4rem)] items-start">
        <div className="grid w-full max-w-[560px] mx-auto grid-cols-1 gap-4 sm:gap-6">
          {post.image_urls?.map((url) => (
            <div key={url} className="relative w-full aspect-[4/5]">
              <Image
                src={url}
                alt={post.title || ""}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
                className="object-cover rounded-2xl border border-border"
              />
            </div>
          ))}
        </div>

        <div className="relative w-full max-w-[620px] mx-auto">
          <div>
            {post.users?.id ? (
              <Link 
                href={`/users/${post.users.username}`}
                className="inline-flex items-center gap-4 hover:opacity-80 transition group"
              >
                <div className="relative w-12 h-12 shrink-0">
                  {post.users?.avatar_url ? (
                    <Image
                      src={post.users.avatar_url}
                      alt=""
                      fill
                      sizes="48px"
                      className="rounded-full object-cover border border-border"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full border border-border bg-neutral-50" />
                  )}
                </div>
                <div>
                  <p className="text-xs text-subtle">投稿者</p>
                  <span className="text-sm sm:text-base font-medium group-hover:text-neutral-600 transition">
                    {post.users?.display_name || post.users?.username || "名称非公開"}
                  </span>
                </div>
              </Link>
            ) : (
              <div className="flex items-center gap-4">
                <div className="shrink-0">
                  <div className="w-12 h-12 rounded-full border border-border bg-neutral-50" />
                </div>
                <div>
                  <p className="text-xs text-subtle">投稿者</p>
                  <span className="text-sm sm:text-base font-medium">名称非公開</span>
                </div>
              </div>
            )}

            <div className="mt-8 sm:mt-10">
              <AutoTranslatedText
                text={post.title}
                as="h1"
                className="text-[clamp(1.75rem,3vw,2.5rem)] font-medium leading-[1.35]"
              />

              <div className="mt-6 grid grid-cols-2 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.35fr)_minmax(0,1.25fr)_minmax(0,0.8fr)] gap-3">
                {post.brands && (
                  <div className="min-w-0">
                    <span className="mb-2 block px-3 text-[8px] leading-none tracking-[0.14em] text-subtle uppercase">Brand</span>
                    <Link
                      href={`/brands/${post.brands.regions.slug}/${post.brands.countries.slug}/${post.brands.slug}`}
                      className="flex min-h-10 min-w-0 items-center justify-center rounded-full border border-border/60 bg-surface px-4 py-2 text-foreground transition-colors hover:bg-background hover:border-border"
                    >
                      <span className="min-w-0 truncate text-xs leading-none">{post.brands.name}</span>
                    </Link>
                  </div>
                )}
                {post.designers && (
                  <div className="min-w-0">
                    <span className="mb-2 block px-3 text-[8px] leading-none tracking-[0.14em] text-subtle uppercase">Designer</span>
                    <Link
                      href={`/designers/${post.designers.regions.slug}/${post.designers.countries.slug}/${post.designers.slug}`}
                      className="flex min-h-10 min-w-0 items-center justify-center rounded-full border border-border/60 bg-surface px-4 py-2 text-foreground transition-colors hover:bg-background hover:border-border"
                    >
                      <span className="min-w-0 truncate text-xs leading-none">{post.designers.name}</span>
                    </Link>
                  </div>
                )}
                {post.brands && post.year && post.season && (
                  <div className="min-w-0">
                    <span className="mb-2 block px-3 text-[8px] leading-none tracking-[0.14em] text-subtle uppercase">Collection</span>
                    <Link
                      href={`/collections/${post.brands.slug}/${post.year}-${post.season}`}
                      className="flex min-h-10 min-w-0 items-center justify-center rounded-full border border-border/60 bg-surface px-2 py-2 text-foreground transition-colors hover:bg-background hover:border-border"
                    >
                      <span className="min-w-0 truncate text-[11px] leading-none">{post.brands.name} {post.year} {post.season.toUpperCase()}</span>
                    </Link>
                  </div>
                )}
                {post.year && post.season && (
                  <div className="min-w-0">
                    <span className="mb-2 block px-3 text-[8px] leading-none tracking-[0.14em] text-subtle uppercase">Season</span>
                    <Link
                      href={`/collections/season/${post.year}-${post.season}`}
                      className="flex min-h-10 min-w-0 items-center justify-center rounded-full border border-border/60 bg-surface px-4 py-2 text-foreground transition-colors hover:bg-background hover:border-border"
                    >
                      <span className="text-xs leading-none whitespace-nowrap">{post.year} {post.season.toUpperCase()}</span>
                    </Link>
                  </div>
                )}
              </div>

              {post.post_tags?.some((pt) => pt.tags?.slug && pt.tags?.name) && (
                <div className="mt-5">
                  <span className="mb-2 block px-3 text-[8px] leading-none tracking-[0.14em] text-subtle uppercase">
                    Tags
                  </span>
                  <div className="flex flex-wrap items-center gap-2.5">
                    {post.post_tags.map((pt) => (
                      pt.tags?.slug && pt.tags?.name ? (
                      <Link
                        key={pt.tags.slug}
                        href={`/tags/${pt.tags.slug}`}
                        aria-label={`${pt.tags.name}のタグを表示`}
                        className="group/tag inline-flex min-h-9 items-center gap-1.5 rounded-full border border-foreground/20 bg-surface px-4 py-2 text-xs tracking-[0.05em] text-foreground shadow-[0_1px_2px_rgba(28,26,24,0.04)] transition-all duration-200 hover:bg-foreground hover:text-background hover:border-foreground"
                      >
                        <span className="text-subtle transition-colors group-hover/tag:text-background/60" aria-hidden="true">#</span>
                        <span>{pt.tags.name}</span>
                      </Link>
                      ) : null
                    ))}
                  </div>
                </div>
              )}

              {post.description && (
                <AutoTranslatedText
                  text={post.description}
                  as="p"
                  className="mt-6 text-[14px] sm:text-[15px] leading-7 sm:leading-8 text-muted whitespace-pre-line"
                />
              )}
            </div>

            <div className="mt-8 sm:mt-12 flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={handleLike}
                  disabled={likeLoading}
                  aria-label={liked ? "いいねを解除" : "いいね"}
                  className={`border rounded-xl min-h-12 min-w-12 px-3.5 py-2.5 text-xs font-medium transition duration-200 active:scale-[0.98] flex items-center justify-center gap-2 shrink-0 ${
                    liked 
                      ? "bg-black text-white border-black" 
                      : "bg-surface text-foreground border-border hover:bg-neutral-50"
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="0.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`transition-colors duration-200 ${liked ? "text-white" : "text-foreground"}`}
                  >
                    <path d="M 3.5 12.5 L 12 21.5 L 20.5 12.5 L 21 8.5 L 17.5 3 L 6.5 3 L 3 8.5 Z" />
                    <path d="M 6.5 3 L 8.5 8.5 L 15.5 8.5 L 17.5 3" opacity="0.6" />
                    <path d="M 3 8.5 L 8.5 8.5 L 12 3 L 15.5 8.5 L 21 8.5" opacity="0.6" />
                    <path d="M 8.5 8.5 L 12 21.5 L 15.5 8.5" opacity="0.6" />
                    <path d="M 3.5 12.5 L 8.5 12.5 L 12 21.5 L 15.5 12.5 L 20.5 12.5" opacity="0.4" />
                    <path d="M 8.5 8.5 L 12 12.5 L 15.5 8.5" opacity="0.4" />
                    <path d="M 12 3 L 12 8.5 L 12 12.5" opacity="0.4" />
                  </svg>
                  {likeCount > 0 && <span className="text-xs font-mono">{likeCount}</span>}
                </button>
                
                <button
                  onClick={handleBookmark}
                  disabled={bookmarkLoading}
                  className={`border rounded-xl min-h-12 px-5 py-2.5 text-xs tracking-wider font-medium transition duration-200 active:scale-[0.98] flex-1 min-w-[120px] ${
                    bookmarked 
                      ? "bg-neutral-100 text-muted border-neutral-200" 
                      : "bg-surface text-foreground border-border hover:bg-neutral-50"
                  }`}
                >
                  {bookmarked ? "保存済み" : "保存する"}
                </button>
                
                {!isOwnPost && (
                  <button
                    onClick={handleFollow}
                    disabled={followLoading}
                    className={`border rounded-xl min-h-12 px-5 py-2.5 text-xs tracking-wider font-medium transition duration-200 active:scale-[0.98] flex-1 min-w-[120px] ${
                      following 
                        ? "bg-neutral-50 text-subtle border-border" 
                        : "bg-surface text-foreground border-border hover:bg-neutral-50"
                    }`}
                  >
                    {following ? "フォロー中" : "フォローする"}
                  </button>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>

      {relatedPosts.length > 0 && (
        <div className="border-t border-border pt-12 sm:pt-16">
          <h2 className="text-xs tracking-[0.2em] font-medium text-muted uppercase mb-8">
            Related Posts
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {relatedPosts.map((rPost) => {
              const rPrefix = rPost.brands?.slug || "archive"
              return (
                <Link
                  key={rPost.id}
                  href={`/posts/${rPrefix}-${rPost.id}`}
                  className="group flex flex-col gap-3"
                >
                  <div className="relative w-full aspect-[4/5] overflow-hidden rounded-xl border border-border bg-neutral-50">
                    {rPost.image_urls?.[0] ? (
                      <Image
                        src={rPost.image_urls[0]}
                        alt={rPost.title || ""}
                        fill
                        sizes="(max-width: 768px) 50vw, 25vw"
                        className="object-cover transition duration-500 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div className="w-full h-full bg-neutral-100" />
                    )}
                  </div>
                  <h3 className={`text-xs sm:text-sm font-medium text-foreground line-clamp-1 group-hover:text-neutral-600 transition ${
                    ""
                  }`}>
                    {rPost.title}
                  </h3>
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </main>
  )
}
