"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { supabase } from "@/lib/supabase"

type Props = {
  currentUserId: string
}

type TimelinePost = {
  id: string
  title: string | null
  image_urls: string[]
  created_at: string
  brand_slug: string | null
  users: {
    id: string
    username: string | null
    display_name: string | null
    avatar_url: string | null
  } | null
}

export default function FollowingTimeline({ currentUserId }: Props) {
  const [posts, setPosts] = useState<TimelinePost[]>([])
  const [loading, setLoading] = useState(true)
  const [isPlusMember, setIsPlusMember] = useState(false)

  useEffect(() => {
    const fetchTimeline = async () => {
      setLoading(true)

      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const isAdmin = user?.user_metadata?.role === "admin" || user?.role === "admin" || user?.app_metadata?.role === "admin"
        const { data: memberData } = await supabase
          .from("users")
          .select("plus_member, plus_members, is_active")
          .eq("id", user.id)
          .maybeSingle()
        
        const hasValidFlag = memberData?.plus_member === true || memberData?.plus_members === true || memberData?.is_active === true
        const memberStatus = isAdmin || hasValidFlag
        setIsPlusMember(memberStatus)

        if (!memberStatus) {
          setLoading(false)
          return
        }
      } else {
        setIsPlusMember(false)
        setLoading(false)
        return
      }

      const { data: followData, error: followError } = await supabase
        .from("follows")
        .select("following_id")
        .eq("follower_id", currentUserId)

      if (followError) {
        console.error(followError)
        setLoading(false)
        return
      }

      const followingIds = (followData || []).map((f) => f.following_id)

      if (followingIds.length === 0) {
        setPosts([])
        setLoading(false)
        return
      }

      const { data: postData, error: postError } = await supabase
        .from("posts")
        .select(`
          id,
          title,
          image_urls,
          created_at,
          brand_slug,
          users (
            id,
            username,
            display_name,
            avatar_url
          )
        `)
        .in("user_id", followingIds)
        .order("created_at", { ascending: false })

      if (postError) {
        console.error(postError)
        setLoading(false)
        return
      }

      if (postData) {
        const formattedPosts: TimelinePost[] = postData.map((post: any) => {
          const rawUser = Array.isArray(post.users) ? post.users[0] : post.users
          return {
            id: post.id,
            title: post.title,
            image_urls: post.image_urls,
            created_at: post.created_at,
            brand_slug: post.brand_slug,
            users: rawUser ? {
              id: rawUser.id,
              username: rawUser.username,
              display_name: rawUser.display_name,
              avatar_url: rawUser.avatar_url
            } : null
          }
        })
        setPosts(formattedPosts)
      } else {
        setPosts([])
      }

      setLoading(false)
    }

    if (currentUserId) {
      fetchTimeline()
    }
  }, [currentUserId])

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto mt-6 animate-pulse">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex flex-col gap-3">
              <div className="w-full aspect-[4/5] bg-neutral-100 rounded-xl border border-neutral-200/60" />
              <div className="flex flex-col gap-1.5 px-1>">
                <div className="h-4 bg-neutral-100 rounded w-5/6" />
                <div className="h-3 bg-neutral-100 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!isPlusMember) {
    return (
      <main className="max-w-6xl mx-auto p-10 md:p-14 lg:p-16 text-center flex flex-col items-center justify-center min-h-[50vh]">
        <div className="max-w-md w-full p-8 border border-border bg-white rounded-2xl shadow-xl">
          <h1 className="text-base font-semibold tracking-[0.05em] text-foreground uppercase">
            MEMBER限定機能
          </h1>
          <p className="mt-4 text-xs text-muted leading-relaxed">
            フォローしているユーザーたちの最新の投稿をタイムライン形式でまとめてチェックできる機能です。本機能の利用にはMEMBER登録が必要です。
          </p>
          <Link
            href="/members"
            className="mt-8 block w-full text-center bg-black text-white font-medium rounded-xl px-4 py-3 text-[12px] transition-colors duration-200 hover:bg-neutral-800"
          >
            MEMBERに登録する
          </Link>
          <Link 
            href="/" 
            className="mt-4 inline-block text-[11px] text-subtle hover:text-foreground transition-colors duration-200"
          >
            トップページに戻る
          </Link>
        </div>
      </main>
    )
  }

  if (posts.length === 0) {
    return (
      <div className="p-12 text-center text-sm text-subtle border border-dashed rounded-2xl max-w-4xl mx-auto mt-6">
        フォロー中のユーザーの投稿はまだありません。
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto mt-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        {posts.map((post) => {
          const prefix = post.brand_slug || "archive"
          return (
            <Link
              key={post.id}
              href={`/posts/${prefix}-${post.id}`}
              className="group flex flex-col gap-3 active:scale-[0.99]"
            >
              <div className="relative w-full aspect-[4/5] overflow-hidden rounded-xl border border-border bg-surface">
                {post.image_urls?.[0] && (
                  <Image
                    src={post.image_urls[0]}
                    alt=""
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover transition duration-500 group-hover:scale-[1.02]"
                  />
                )}
              </div>

              <div className="flex flex-col gap-1 px-1 min-w-0">
                <h3 className="text-xs sm:text-sm font-medium text-foreground line-clamp-1 group-hover:text-neutral-600 transition duration-200">
                  {post.title}
                </h3>
                
                {post.users && (
                  <p className="text-[11px] text-subtle truncate">
                    by {post.users.display_name || `@${post.users.username}` || "名称非公開"}
                  </p>
                )}
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}