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
  users: {
    id: string
    username: string | null
    avatar_url: string | null
  } | null
}

type Props = {
  id: string
}

export default function PostPageClient({ id }: Props) {
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [isPlusMember, setIsPlusMember] = useState(false)
  const [dailyViewLimitReached, setDailyViewLimitReached] = useState(false)
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
        const { data: profile } = await supabase
          .from("profiles")
          .select("plus_member")
          .eq("id", user.id)
          .single()

        const plus = !!profile?.plus_member
        setIsPlusMember(plus)

        if (!plus) {
          const today = new Date().toISOString().split("T")[0]
          const { count } = await supabase
            .from("post_views")
            .select("*", { count: "exact", head: true })
            .eq("user_id", user.id)
            .eq("view_date", today)

          if ((count || 0) >= 50) {
            setDailyViewLimitReached(true)
            setLoading(false)
            return
          }

          await supabase
            .from("post_views")
            .insert({
              user_id: user.id,
              post_id: id,
              view_date: today,
            })
        }
      }

      const { data, error } = await supabase
        .from("posts")
        .select(`
          *,
          users (
            id,
            username,
            avatar_url
          )
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
    if (!isPlusMember) {
      alert("PLUS MEMBER限定機能です")
      return false
    }
    return true
  }

  const handleLike = async () => {
    if (!requirePlus()) return
    if (!currentUserId) {
      alert("ログインが必要です")
      return
    }
    if (likeLoading) return
    setLikeLoading(true)

    if (liked) {
      await supabase
        .from("likes")
        .delete()
        .eq("post_id", id)
        .eq("user_id", currentUserId)

      setLiked(false)
      setLikeCount((prev) => prev - 1)
    } else {
      await supabase
        .from("likes")
        .insert({
          post_id: id,
          user_id: currentUserId,
        })

      setLiked(true)
      setLikeCount((prev) => prev + 1)
    }
    setLikeLoading(false)
  }

  const handleFollow = async () => {
    if (!requirePlus()) return
    if (!currentUserId) {
      alert("ログインが必要です")
      return
    }
    if (!post?.users?.id) return
    if (currentUserId === post.users.id) return
    if (followLoading) return
    setFollowLoading(true)

    if (following) {
      await supabase
        .from("follows")
        .delete()
        .eq("follower_id", currentUserId)
        .eq("following_id", post.users.id)

      setFollowing(false)
    } else {
      await supabase
        .from("follows")
        .insert({
          follower_id: currentUserId,
          following_id: post.users.id,
        })

      setFollowing(true)
    }
    setFollowLoading(false)
  }

  const handleBookmark = async () => {
    if (!requirePlus()) return
    if (!currentUserId) {
      alert("ログインが必要です")
      return
    }
    if (bookmarkLoading) return
    setBookmarkLoading(true)

    if (bookmarked) {
      await supabase
        .from("bookmarks")
        .delete()
        .eq("post_id", id)
        .eq("user_id", currentUserId)

      setBookmarked(false)
    } else {
      await supabase
        .from("bookmarks")
        .insert({
          post_id: id,
          user_id: currentUserId,
        })

      setBookmarked(true)
    }
    setBookmarkLoading(false)
  }

  if (loading) {
    return <main className="p-6 sm:p-10 text-sm text-muted">読み込み中...</main>
  }

  if (dailyViewLimitReached) {
    return (
      <main className="max-w-2xl p-6 sm:p-10 md:p-14 lg:p-16">
        <h1 className="text-3xl sm:text-4xl font-medium">閲覧制限に達しました</h1>
        <p className="mt-6 text-[14px] sm:text-base leading-7 sm:leading-8 text-muted">
          無料会員は1日50枚まで画像を閲覧できます。
          PLUS MEMBERになると無制限で閲覧できます。
        </p>
        <Link
          href="/members"
          className="mt-8 sm:mt-10 inline-block border border-black bg-black text-white rounded-xl px-5 sm:px-6 py-3.5 sm:py-4 text-xs sm:text-sm tracking-[0.08em] transition hover:opacity-80"
        >
          PLUS MEMBERになる
        </Link>
      </main>
    )
  }

  if (!post) {
    return <main className="p-6 sm:p-10 text-sm text-muted">投稿が見つかりませんでした</main>
  }

  return (
    <main className="max-w-6xl mx-auto p-6 sm:p-10 md:p-14 lg:p-16">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        <div className="grid grid-cols-1 gap-4 sm:gap-6">
          {post.image_urls?.map((url) => (
            <img
              key={url}
              src={url}
              alt=""
              className="w-full rounded-2xl border border-border"
            />
          ))}
        </div>

        <div>
          <div className="flex items-center gap-4">
            <Link href={`/users/${post.users?.id}`} className="shrink-0">
              {post.users?.avatar_url ? (
                <img
                  src={post.users.avatar_url}
                  alt=""
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full border border-border bg-neutral-50" />
              )}
            </Link>
            <div>
              <p className="text-xs text-subtle">投稿者</p>
              <Link href={`/users/${post.users?.id}`} className="text-sm sm:text-base font-medium hover:underline">
                {post.users?.username || "名称非公開"}
              </Link>
            </div>
          </div>

          <div className="mt-8 sm:mt-10">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-medium leading-snug">
              {post.title}
            </h1>
            {post.description && (
              <p className="mt-4 sm:mt-6 text-[14px] sm:text-[15px] leading-7 sm:leading-8 text-muted whitespace-pre-line">
                {post.description}
              </p>
            )}
          </div>

          <div className="mt-8 sm:mt-12 flex flex-wrap items-center gap-3 sm:gap-4">
            <button
              onClick={handleLike}
              disabled={likeLoading}
              className="border border-border bg-surface rounded-xl px-4 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-medium hover:bg-black hover:text-white transition duration-300"
            >
              {liked ? "♥ お気に入り済み" : "♡ お気に入り"} ({likeCount})
            </button>
            <Link
              href={`/posts/${id}/likes`}
              className="text-xs sm:text-sm underline text-muted hover:text-foreground transition"
            >
              お気に入りを見る
            </Link>
            <button
              onClick={handleBookmark}
              disabled={bookmarkLoading}
              className="border border-border bg-surface rounded-xl px-4 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-medium hover:bg-black hover:text-white transition duration-300"
            >
              {bookmarked ? "保存済み" : "保存"}
            </button>
            {currentUserId !== post.users?.id && (
              <button
                onClick={handleFollow}
                disabled={followLoading}
                className="border border-border bg-surface rounded-xl px-4 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-medium hover:bg-black hover:text-white transition duration-300"
              >
                {following ? "フォロー中" : "フォロー"}
              </button>
            )}
          </div>

          <div className="mt-12 sm:mt-16">
            <Link href="/" className="text-xs sm:text-sm underline text-muted hover:text-foreground transition">
              ホームに戻る
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}