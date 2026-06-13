"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
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
    region_slug: string
    country_slug: string
  } | null
  designers: {
    slug: string
    name: string
    region_slug: string
    country_slug: string
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

  useEffect(() => {
    const fetchPost = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        setCurrentUserId(user.id)
        
        const isAdmin = 
          user?.user_metadata?.role === "admin" || 
          user?.role === "admin" ||
          user?.app_metadata?.role === "admin"

        const { data: memberData } = await supabase
          .from("users")
          .select("plus_member, plus_members, is_active")
          .eq("id", user.id)
          .maybeSingle()

        const hasValidFlag = 
          memberData?.plus_member === true || 
          memberData?.plus_members === true || 
          memberData?.is_active === true

        setIsPlusMember(isAdmin || hasValidFlag)
      }

      const { data, error } = await supabase
        .from("posts")
        .select(`
          *,
          users (id, username, avatar_url),
          brands (slug, name, region_slug, country_slug),
          designers (slug, name, region_slug, country_slug),
          post_tags (tags (slug, name))
        `)
        .eq("id", id)
        .single()

      if (error || !data) {
        console.error("投稿の取得に失敗しました:", error)
        setLoading(false)
        return
      }

      setPost(data)

      const { count } = await supabase
        .from("likes")
        .select("*", { count: "exact", head: true })
        .eq("post_id", id)

      setLikeCount(count || 0)

      if (user) {
        const { data: likedData } = await supabase
          .from("likes")
          .select("id")
          .eq("post_id", id)
          .eq("user_id", user.id)
          .maybeSingle()

        setLiked(!!likedData)

        if (data.users?.id) {
          const { data: followData } = await supabase
            .from("follows")
            .select("id")
            .eq("follower_id", user.id)
            .eq("following_id", data.users.id)
            .maybeSingle()

          setFollowing(!!followData)
        }

        const { data: bookmarkData } = await supabase
          .from("bookmarks")
          .select("id")
          .eq("post_id", id)
          .eq("user_id", user.id)
          .maybeSingle()

        setBookmarked(!!bookmarkData)
      }

      setLoading(false)
    }

    fetchPost()
  }, [id])

  const requirePlus = () => {
    if (!currentUserId) {
      alert("MEMBER限定機能です。ログインまたは会員登録が必要です。")
      window.location.href = "/members"
      return false
    }
    if (!isPlusMember) {
      alert("MEMBER限定機能です。")
      return false
    }
    return true
  }

  const handleLike = async () => {
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
            <img key={url} src={url} alt="" className="w-full rounded-2xl border border-border" />
          ))}
        </div>

        <div className="relative">
          {!isPlusMember && (
            <div className="absolute inset-0 z-20 bg-gradient-to-t from-background via-background/95 to-transparent backdrop-blur-[6px] flex flex-col items-center justify-center text-center px-4 pt-32">
              <div className="max-w-sm p-6 border border-border bg-surface rounded-2xl shadow-xl">
                <h2 className="text-lg font-semibold text-foreground">詳細データは限定コンテンツです</h2>
                <p className="mt-3 text-xs text-muted leading-relaxed">
                  このアイテムのブランド、デザイナー、関連タグ、アーカイブ解説の閲覧や、お気に入り・保存機能を利用するには、MEMBERへの登録が必要です。
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
            <div className="flex items-center gap-4">
              <div className="shrink-0">
                {post.users?.avatar_url ? (
                  <img src={post.users.avatar_url} alt="" className="w-12 h-12 rounded-full object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-full border border-border bg-neutral-50" />
                )}
              </div>
              <div>
                <p className="text-xs text-subtle">投稿者</p>
                <span className="text-sm sm:text-base font-medium">
                  {post.users?.username || "名称非公開"}
                </span>
              </div>
            </div>

            <div className="mt-8 sm:mt-10">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-medium leading-snug">
                {post.title}
              </h1>

              <div className="mt-6 flex flex-wrap items-center gap-2">
                {post.brands && (
                  <span className="bg-neutral-100 px-3 py-1 rounded-full text-xs">
                    {post.brands.name}
                  </span>
                )}
                {post.designers && (
                  <span className="bg-neutral-100 px-3 py-1 rounded-full text-xs">
                    {post.designers.name}
                  </span>
                )}
                {post.collection_slug && (
                  <span className="bg-neutral-100 px-3 py-1 rounded-full text-xs">
                    {post.brand_slug} {post.year} {post.season}
                  </span>
                )}
                {post.year && post.season && (
                  <span className="bg-neutral-100 px-3 py-1 rounded-full text-xs">
                    {post.year} {post.season}
                  </span>
                )}
                {post.post_tags?.map((pt: any) => (
                  pt.tags?.slug && pt.tags?.name ? (
                    <span key={pt.tags.slug} className="text-neutral-400 text-xs">
                      #{pt.tags.name}
                    </span>
                  ) : null
                ))}
              </div>

              {post.description && (
                <p className="mt-6 text-[14px] sm:text-[15px] leading-7 sm:leading-8 text-muted whitespace-pre-line">
                  {post.description}
                </p>
              )}
            </div>

            <div className="mt-8 sm:mt-12 flex flex-wrap items-center gap-3 sm:gap-4">
              <button
                onClick={handleLike}
                disabled={likeLoading}
                className={`border border-border bg-surface rounded-xl px-4 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-medium transition duration-200 active:scale-[0.98] ${
                  liked ? "text-red-500 border-red-200 bg-red-50/10" : "hover:bg-neutral-50"
                }`}
              >
                {liked ? `♥ お気に入り中 (${likeCount})` : `♡ お気に入り (${likeCount})`}
              </button>
              
              <button
                onClick={handleBookmark}
                disabled={bookmarkLoading}
                className={`border border-border bg-surface rounded-xl px-4 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-medium transition duration-200 active:scale-[0.98] ${
                  bookmarked ? "text-yellow-600 border-yellow-200 bg-yellow-50/10" : "hover:bg-neutral-50"
                }`}
              >
                {bookmarked ? "★ 保存済み" : "☆ 保存"}
              </button>
              
              {!isOwnPost ? (
                <button
                  onClick={handleFollow}
                  disabled={followLoading}
                  className={`border border-border bg-surface rounded-xl px-4 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-medium transition duration-200 active:scale-[0.98] ${
                    following ? "text-blue-500 border-blue-200 bg-blue-50/10" : "hover:bg-neutral-50"
                  }`}
                >
                  {following ? "✓ フォロー中" : "+ フォローする"}
                </button>
              ) : (
                <button
                  disabled
                  className="border border-border bg-neutral-50/50 text-neutral-400 rounded-xl px-4 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-medium cursor-not-allowed opacity-50"
                >
                  自らをフォローすることはできません
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}