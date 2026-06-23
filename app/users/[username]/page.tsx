"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { useAuthModal } from "@/context/AuthModalContext"
import FollowList from "@/components/FollowList"
import FollowingTimeline from "@/components/FollowingTimeline"

type UserProfile = {
  id: string
  username: string | null
  display_name: string | null
  bio: string | null
  avatar_url: string | null
}

type Post = {
  id: string
  image_urls: string[]
  title: string | null
  brand_slug: string | null
}

type TabType = "posts" | "followers" | "following" | "timeline"

export default function UserPage() {
  const params = useParams()
  const rawUsername = params.username as string
  const username = rawUsername ? decodeURIComponent(rawUsername).replace(/^@/, "") : ""

  const { openAuthModal } = useAuthModal()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [isPlusMember, setIsPlusMember] = useState(false)
  const [following, setFollowing] = useState(false)
  const [followersCount, setFollowersCount] = useState(0)
  const [followingCount, setFollowingCount] = useState(0)
  const [postsCount, setPostsCount] = useState(0)
  const [followLoading, setFollowLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<TabType>("posts")
  const [initialFetched, setInitialFetched] = useState(false)

  useEffect(() => {
    if (!username) return

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

      const { data: profileData } = await supabase
        .from("users")
        .select("id, username, display_name, bio, avatar_url")
        .eq("username", username)
        .maybeSingle()

      if (!profileData) {
        setInitialFetched(true)
        return
      }

      setProfile(profileData)
      const targetUserId = profileData.id

      const { data: postsData } = await supabase
        .from("posts")
        .select("id, image_urls, title, brand_slug")
        .eq("user_id", targetUserId)
        .order("created_at", { ascending: false })

      setPosts(postsData || [])
      setPostsCount(postsData?.length || 0)

      const { count: followers } = await supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("following_id", targetUserId)

      setFollowersCount(followers || 0)

      const { count: followingTotal } = await supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("follower_id", targetUserId)

      setFollowingCount(followingTotal || 0)

      if (user) {
        const { data: followData } = await supabase
          .from("follows")
          .select("id")
          .eq("follower_id", user.id)
          .eq("following_id", targetUserId)
          .maybeSingle()

        setFollowing(!!followData)
      }

      setInitialFetched(true)
    }

    fetchData()
  }, [username])

  const handleFollow = async () => {
    if (!currentUserId || !isPlusMember) {
      openAuthModal()
      return
    }
    if (!profile || currentUserId === profile.id) return
    if (followLoading) return

    setFollowLoading(true)

    if (following) {
      await supabase
        .from("follows")
        .delete()
        .eq("follower_id", currentUserId)
        .eq("following_id", profile.id)

      setFollowing(false)
      setFollowersCount((prev) => prev - 1)
    } else {
      await supabase
        .from("follows")
        .insert({
          follower_id: currentUserId,
          following_id: profile.id,
        })

      setFollowing(true)
      setFollowersCount((prev) => prev + 1)
    }

    setFollowLoading(false)
  }

  if (initialFetched && !profile) {
    return (
      <main className="max-w-6xl mx-auto p-6 sm:p-10 text-center py-20">
        <p className="text-sm text-subtle">ユーザーが見つかりませんでした</p>
      </main>
    )
  }

  if (!profile) return null

  const displayUsername = `@${profile.username}`
  const isOwnProfile = currentUserId === profile.id

  return (
    <main className="max-w-6xl mx-auto p-6 sm:p-10 md:p-14 lg:p-16">
      <section className="w-full">
        <div className="flex items-center gap-5 sm:gap-8 md:gap-10">
          <div className="relative w-20 h-20 sm:w-28 sm:h-28 flex-shrink-0">
            {profile.avatar_url ? (
              <Image
                src={profile.avatar_url}
                alt=""
                fill
                sizes="(max-width: 640px) 80px, 112px"
                className="rounded-full object-cover border border-border"
              />
            ) : (
              <div className="w-full h-full rounded-full border border-border bg-neutral-50" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-3xl font-normal tracking-wide text-foreground uppercase truncate">
              {profile.display_name || profile.username || "名称非公開"}
            </h1>
            {profile.display_name && profile.username && (
              <p className="text-sm sm:text-lg font-light tracking-wide text-muted truncate mt-1">
                {displayUsername}
              </p>
            )}
          </div>
        </div>

        <div className={`mt-6 sm:mt-8 grid border-t border-b sm:border-none border-neutral-100 py-3.5 sm:py-0 ${isOwnProfile ? 'grid-cols-4 sm:flex sm:flex-wrap sm:gap-8' : 'grid-cols-3 sm:flex sm:flex-wrap sm:gap-8'}`}>
          <button
            onClick={() => setActiveTab("posts")}
            className={`text-center sm:text-left hover:opacity-70 transition duration-200 ${activeTab === "posts" ? "text-foreground" : "text-subtle"}`}
          >
            <p className="text-lg sm:text-2xl font-medium tracking-tight">{postsCount}</p>
            <p className="text-[10px] sm:text-xs font-medium tracking-wider text-subtle mt-0.5">投稿</p>
          </button>

          <button
            onClick={() => setActiveTab("followers")}
            className={`text-center sm:text-left hover:opacity-70 transition duration-200 ${activeTab === "followers" ? "text-foreground" : "text-subtle"}`}
          >
            <p className="text-lg sm:text-2xl font-medium tracking-tight">{followersCount}</p>
            <p className="text-[10px] sm:text-xs font-medium tracking-wider text-subtle mt-0.5">フォロワー</p>
          </button>

          <button
            onClick={() => setActiveTab("following")}
            className={`text-center sm:text-left hover:opacity-70 transition duration-200 ${activeTab === "following" ? "text-foreground" : "text-subtle"}`}
          >
            <p className="text-lg sm:text-2xl font-medium tracking-tight">{followingCount}</p>
            <p className="text-[10px] sm:text-xs font-medium tracking-wider text-subtle mt-0.5">フォロー中</p>
          </button>

          {isOwnProfile && (
            <button
              onClick={() => setActiveTab("timeline")}
              className={`flex flex-col items-center sm:items-start justify-center sm:justify-start hover:opacity-70 transition duration-200 ${activeTab === "timeline" ? "text-foreground" : "text-subtle"}`}
            >
              <div className="h-[27px] sm:h-[32px] flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="sm:w-[18px] sm:h-[18px]">
                  <path d="M3 10h18M3 14h18M3 18h18M3 6h18"/>
                </svg>
              </div>
              <p className="text-[10px] sm:text-xs font-medium tracking-wider text-subtle mt-0.5">タイムライン</p>
            </button>
          )}
        </div>

        {profile.bio && (
          <p className="mt-5 max-w-2xl leading-relaxed text-muted whitespace-pre-line text-xs sm:text-sm text-left px-1 sm:px-0">
            {profile.bio}
          </p>
        )}

        {!isOwnProfile && (
          <div className="mt-5 sm:mt-8 w-full sm:w-auto">
            <button
              onClick={handleFollow}
              disabled={followLoading}
              className="w-full sm:w-auto border border-border bg-white rounded-xl px-8 py-2.5 text-xs font-medium hover:bg-foreground hover:text-background hover:border-foreground transition duration-200 active:scale-[0.98]"
            >
              {following ? "フォロー中" : "フォローする"}
            </button>
          </div>
        )}
      </section>

      <section className="mt-12 sm:mt-16 md:mt-20 border-t border-border pt-8 sm:pt-10">
        {activeTab === "posts" && (
          <>
            <div className="flex flex-col gap-0.5">
              <h2 className="text-lg sm:text-xl tracking-[0.1em] uppercase font-medium text-foreground">
                ARCHIVE CLOSET
              </h2>
              <p className="text-[10px] sm:text-xs tracking-[0.14em] text-subtle font-medium">
                クローゼット
              </p>
            </div>

            {posts.length === 0 ? (
              <p className="mt-8 text-xs sm:text-sm text-subtle leading-relaxed">まだ投稿されたアイテムはありません。</p>
            ) : (
              <div className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-12">
                {posts.map((post) => {
                  const prefix = post.brand_slug || "archive"
                  return (
                    <Link key={post.id} href={`/posts/${prefix}-${post.id}`} className="group block">
                      <article className="space-y-2.5 sm:space-y-3.5">
                        <div className="overflow-hidden rounded-xl sm:rounded-2xl border border-border bg-surface aspect-[4/5] relative w-full">
                          <Image
                            src={post.image_urls?.[0]}
                            alt={post.title || ""}
                            fill
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                            className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                          />
                        </div>
                        {post.title && (
                          <div className="px-0.5 sm:px-1">
                            <p className="text-xs sm:text-sm font-medium text-foreground leading-snug group-hover:text-neutral-600 transition duration-200 break-words line-clamp-1">
                              {post.title}
                            </p>
                          </div>
                        )}
                      </article>
                    </Link>
                  )
                })}
              </div>
            )}
          </>
        )}

        {activeTab === "followers" && (
          <FollowList userId={profile.id} type="followers" />
        )}

        {activeTab === "following" && (
          <FollowList userId={profile.id} type="following" />
        )}

        {activeTab === "timeline" && isOwnProfile && (
          <FollowingTimeline currentUserId={profile.id} />
        )}
      </section>
    </main>
  )
}