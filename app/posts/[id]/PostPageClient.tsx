"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { supabase } from "@/lib/supabase"

type Post = {
  id: string
  title: string | null
  description: string | null
  image_urls: string[]
  created_at: string
  user_id: string
  brand_slug: string | null
  designer_slug: string | null
  collection_slug: string | null
  season_slug: string | null
  year: number | null
  season: string | null
  users: {
    id: string
    username: string | null
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

type StatusMessage = {
  text: string
  type: "error" | "success"
}

export default function PostPageClient({ id }: Props) {
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [isPlusMember, setIsPlusMember] = useState(false)
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [following, setFollowing] = useState(false)
  const [likeLoading, setLikeLoading] = useState(false)
  const [followLoading, setFollowLoading] = useState(false)
  const [bookmarked, setBookmarked] = useState(false)
  const [bookmarkLoading, setBookmarkLoading] = useState(false)
  const [statusMessage, setStatusMessage] = useState<StatusMessage | null>(null)

  useEffect(() => {
    const fetchPost = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        setCurrentUserId(user.id)
        const isAdmin = user?.user_metadata?.role === "admin" || user?.role === "admin" || user?.app_metadata?.role === "admin"
        const { data: memberData } = await supabase
          .from("users")
          .select("plus_member, plus_members, is_active")
          .eq("id", user.id)
          .maybeSingle()
        const hasValidFlag = memberData?.plus_member === true || memberData?.plus_members === true || memberData?.is_active === true
        setIsPlusMember(isAdmin || hasValidFlag)
      }

      const { data: rawPost, error } = await supabase
        .from("posts")
        .select(`
          *,
          users (id, username, avatar_url),
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
      if (rawPost.brand_slug) {
        const { data } = await supabase
          .from("brands")
          .select("slug, name, regions(slug), countries(slug)")
          .eq("slug", rawPost.brand_slug)
          .maybeSingle()
        brandData = data
      }

      let designerData = null
      if (rawPost.designer_slug) {
        const { data } = await supabase
          .from("designers")
          .select("slug, name, regions(slug), countries(slug)")
          .eq("slug", rawPost.designer_slug)
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
      const expectedPath = `/posts/${slugPrefix}-${id}`
      if (window.location.pathname !== expectedPath) {
        window.history.replaceState(null, "", expectedPath)
      }

      const { count } = await supabase
        .from("likes")
        .select("*", { count: "exact", head: true })
        .eq("post_id", id)
      setLikeCount(count || 0)

      if (user) {
        const { data: likedData } = await supabase.from("likes").select("id").eq("post_id", id).eq("user_id", user.id).maybeSingle()
        setLiked(!!likedData)

        if (rawPost.users?.id) {
          const { data: followData } = await supabase.from("follows").select("id").eq("follower_id", user.id).eq("following_id", rawPost.users.id).maybeSingle()
          setFollowing(!!followData)
        }

        const { data: bookmarkData } = await supabase.from("bookmarks").select("id").eq("post_id", id).eq("user_id", user.id).maybeSingle()
        setBookmarked(!!bookmarkData)
      }

      setLoading(false)
    }

    fetchPost()
  }, [id])
  
  const requirePlus = () => {
    if (!currentUserId || !isPlusMember) {
      setStatusMessage({ text: "本機能の利用にはMEMBER登録が必要です。", type: "error" })
      return false
    }
    return true
  }

  const handleLike = async () => {
    setStatusMessage(null)
    if (!requirePlus() || !currentUserId || likeLoading) return
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
    setStatusMessage(null)
    if (!requirePlus() || !currentUserId || !post?.users?.id || followLoading) return
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
    setStatusMessage(null)
    if (!requirePlus() || !currentUserId || bookmarkLoading) return
    setBookmarkLoading(true)

    if (bookmarked) {
      await supabase.from("bookmarks").delete().eq("post_id", id).eq("user_id", currentUserId)
      setBookmarked(false)
    } else {
      await supabase.from("bookmarks").insert({ post_id: id, user_id: currentUserId })
      setBookmarked(true)
    }
    setBookmarkLoading(false)
  }

  if (loading) {
    return <main className="p-6 sm:p-10 text-sm text-muted">読み込み中...</main>
  }

  if (!post) {
    return <main className="p-6 sm:p-10 text-sm text-muted">投稿が見つかりませんでした</main>
  }

  const isOwnPost = currentUserId === post.user_id

  return (
    <main className="max-w-6xl mx-auto p-6 sm:p-10 md:p-14 lg:p-16">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        <div className="grid grid-cols-1 gap-4 sm:gap-6">
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

        <div className="relative">
          {!isPlusMember && (
            <div className="absolute inset-0 z-20 bg-gradient-to-t from-background via-background/95 to-transparent backdrop-blur-[6px] flex flex-col items-center justify-center text-center px-4 pt-32">
              <div className="max-w-sm p-6 border border-border bg-surface rounded-2xl shadow-xl">
                <h2 className="text-lg font-semibold text-foreground">こちらは限定コンテンツです</h2>
                <p className="mt-3 text-xs text-muted leading-relaxed">
                  アーカイブの詳細、解説の閲覧、およびインタラクション機能の利用にはMEMBER登録が必要です。
                </p>
                <Link
                  href="/members"
                  className="mt-6 block w-full text-center bg-black text-white font-medium rounded-xl px-4 py-3 text-[12px] transition hover:opacity-90"
                >
                  MEMBERに登録する
                </Link>
                <Link href="/" className="mt-4 block text-[11px] text-subtle hover:text-foreground transition">
                  トップページに戻る
                </Link>
              </div>
            </div>
          )}

          <div className={!isPlusMember ? "select-none pointer-events-none filter blur-[2px]" : ""}>
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
                    {post.users?.username || "名称非公開"}
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
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-medium leading-snug">
                {post.title}
              </h1>

              <div className="mt-6 flex flex-wrap items-center gap-2">
                {post.brands && (
                  <Link
                    href={`/brands/${post.brands.regions.slug}/${post.brands.countries.slug}/${post.brands.slug}`}
                    className="bg-neutral-100 px-3 py-1 rounded-full text-xs hover:bg-neutral-200 transition"
                  >
                    {post.brands.name}
                  </Link>
                )}
                {post.designers && (
                  <Link
                    href={`/designers/${post.designers.regions.slug}/${post.designers.countries.slug}/${post.designers.slug}`}
                    className="bg-neutral-100 px-3 py-1 rounded-full text-xs hover:bg-neutral-200 transition"
                  >
                    {post.designers.name}
                  </Link>
                )}
                {post.collection_slug && (
                  <Link
                    href={`/collections/${post.collection_slug}`}
                    className="bg-neutral-100 px-3 py-1 rounded-full text-xs hover:bg-neutral-200 transition"
                  >
                    {post.brands?.name || post.brand_slug} {post.year} {post.season}
                  </Link>
                )}
                {!post.collection_slug && post.year && post.season && (
                  <Link
                    href={`/search?year=${post.year}&season=${post.season}`}
                    className="bg-neutral-100 px-3 py-1 rounded-full text-xs hover:bg-neutral-200 transition"
                  >
                    {post.year} {post.season}
                  </Link>
                )}
                {post.post_tags?.map((pt: any) => (
                  pt.tags?.slug && pt.tags?.name ? (
                    <Link
                      key={pt.tags.slug}
                      href={`/tags/${pt.tags.slug}`}
                      className="text-neutral-400 text-xs hover:text-neutral-600 transition"
                    >
                      #{pt.tags.name}
                    </Link>
                  ) : null
                ))}
              </div>

              {post.description && (
                <p className="mt-6 text-[14px] sm:text-[15px] leading-7 sm:leading-8 text-muted whitespace-pre-line">
                  {post.description}
                </p>
              )}
            </div>

            <div className="mt-8 sm:mt-12 flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={handleLike}
                  disabled={likeLoading}
                  title={liked ? "チェックを解除" : "チェックする"}
                  className={`border rounded-xl px-4 py-3 text-xs font-medium transition duration-200 active:scale-[0.98] flex items-center justify-center gap-2 shrink-0 ${
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
                  className={`border rounded-xl px-5 py-3 text-xs tracking-wider font-medium transition duration-200 active:scale-[0.98] flex-1 min-w-[120px] ${
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
                    className={`border rounded-xl px-5 py-3 text-xs tracking-wider font-medium transition duration-200 active:scale-[0.98] flex-1 min-w-[120px] ${
                      following 
                        ? "bg-neutral-50 text-subtle border-border" 
                        : "bg-surface text-foreground border-border hover:bg-neutral-50"
                    }`}
                  >
                    {following ? "フォロー中" : "フォローする"}
                  </button>
                )}
              </div>

              {statusMessage && (
                <div className={`text-xs p-4 rounded-xl border flex items-center justify-between gap-4 ${
                  statusMessage.type === "error" 
                    ? "text-red-500 bg-red-50/50 border-red-200" 
                    : "text-foreground bg-neutral-50 border-border"
                }`}>
                  <span>{statusMessage.text}</span>
                  <Link href="/members" className="underline font-semibold tracking-wider text-[11px] uppercase shrink-0 hover:opacity-80 transition">
                    登録画面へ
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}