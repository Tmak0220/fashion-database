"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { useAuthModal } from "@/context/AuthModalContext"
import FollowList from "@/components/FollowList"

type UserProfile = {
  id: string
  username: string | null
  bio: string | null
  avatar_url: string | null
}

type Post = {
  id: string
  image_urls: string[]
  title: string | null
}

type TabType = "posts" | "followers" | "following"

export default function UserPage() {
  const params = useParams()
  const rawUsername = params.username as string
  const username = rawUsername ? decodeURIComponent(rawUsername).replace(/^@/, "") : ""

  const { openAuthModal } = useAuthModal()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [isPlusMember, setIsPlusMember] = useState(false)
  const [following, setFollowing] = useState(false)
  const [followersCount, setFollowersCount] = useState(0)
  const [followingCount, setFollowingCount] = useState(0)
  const [postsCount, setPostsCount] = useState(0)
  const [followLoading, setFollowLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<TabType>("posts")

  useEffect(() => {
    if (!username) {
      setLoading(false)
      return
    }

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
        .select("id, username, bio, avatar_url")
        .eq("username", username)
        .maybeSingle()

      if (!profileData) {
        setProfile(null)
        setLoading(false)
        return
      }

      setProfile(profileData)
      const targetUserId = profileData.id

      const { data: postsData } = await supabase
        .from("posts")
        .select("id, image_urls, title")
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

      setLoading(false)
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

  if (loading) {
    return <main className="p-10 text-sm text-muted">読み込み中...</main>
  }

  if (!profile) {
    return <main className="p-10 text-sm text-muted">ユーザーが見つかりませんでした</main>
  }

  const displayUsername = `@${profile.username}`

  return (
    <main className="max-w-6xl mx-auto p-10 md:p-14 lg:p-16">
      <section>
        <div className="flex items-start gap-6">
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt=""
              className="w-24 h-24 rounded-full object-cover border border-border shrink-0"
            />
          ) : (
            <div className="w-24 h-24 rounded-full border border-border bg-neutral-50 shrink-0" />
          )}

          <div>
            <h1 className="text-3xl font-light tracking-wide">
              {profile.username ? displayUsername : "名称非公開"}
            </h1>

            <div className="mt-6 flex gap-8">
              <button 
                onClick={() => setActiveTab("posts")} 
                className={`text-left hover:opacity-70 transition ${activeTab === "posts" ? "text-foreground" : "text-subtle"}`}
              >
                <p className="text-2xl font-medium">{postsCount}</p>
                <p className="text-sm">投稿</p>
              </button>

              <button 
                onClick={() => setActiveTab("followers")} 
                className={`text-left hover:opacity-70 transition ${activeTab === "followers" ? "text-foreground" : "text-subtle"}`}
              >
                <p className="text-2xl font-medium">{followersCount}</p>
                <p className="text-sm">フォロワー</p>
              </button>

              <button 
                onClick={() => setActiveTab("following")} 
                className={`text-left hover:opacity-70 transition ${activeTab === "following" ? "text-foreground" : "text-subtle"}`}
              >
                <p className="text-2xl font-medium">{followingCount}</p>
                <p className="text-sm">フォロー中</p>
              </button>
            </div>

            {profile.bio && (
              <p className="mt-6 max-w-2xl leading-relaxed text-muted whitespace-pre-line text-sm">
                {profile.bio}
              </p>
            )}

            {currentUserId !== profile.id && (
              <button
                onClick={handleFollow}
                disabled={followLoading}
                className="mt-8 border border-border rounded-xl px-5 py-2.5 text-xs font-medium hover:bg-black hover:text-white transition active:scale-[0.98]"
              >
                {following ? "フォロー中" : "フォローする"}
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="mt-20 border-t border-border pt-10">
        {activeTab === "posts" && (
          <>
            <h2 className="text-xl tracking-[0.08em] uppercase font-medium">
              ARCHIVE CLOSET
            </h2>

            {posts.length === 0 ? (
              <p className="mt-8 text-xs text-subtle">まだ投稿されたアイテムはありません。</p>
            ) : (
              <div className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {posts.map((post) => (
                  <Link key={post.id} href={`/posts/archive-${post.id}`} className="group block">
                    <article className="space-y-3">
                      <div className="overflow-hidden rounded-2xl border border-border bg-neutral-50 aspect-[4/5] relative">
                        <img
                          src={post.image_urls?.[0]}
                          alt=""
                          className="w-full h-full object-cover transition duration-500 group-hover:scale-[1.03]"
                        />
                      </div>
                      {post.title && (
                        <p className="text-xs text-foreground font-normal line-clamp-1 group-hover:text-neutral-600 transition px-1">
                          {post.title}
                        </p>
                      )}
                    </article>
                  </Link>
                ))}
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
      </section>
    </main>
  )
}