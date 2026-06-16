"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

import ProfileForm from "@/components/ProfileForm"
import AvatarUpload from "@/components/AvatarUpload"
import CreatePostForm from "@/components/CreatePostForm"

type Profile = {
  id: string
  email: string
  username: string | null
  bio: string | null
  avatar_url: string | null
}

type Post = {
  id: string
  image_urls: string[]
  title: string | null
}

type FollowBrand = {
  brand_slug: string
  brands: {
    name: string
    name_ja: string | null
    region_slug: string
    country_slug: string
  }[] | null
}

type FollowDesigner = {
  designer_slug: string
  designers: {
    name: string
    name_ja: string | null
    region_slug: string
    country_slug: string
  }[] | null
}

type StatusMessage = {
  text: string
  type: "error" | "success"
}

export default function MyPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  
  const fetchPosts = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("posts")
        .select("id, image_urls, title")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
      
      if (error) throw error;
      setPosts(data || []);
    } catch (err) {
      console.error("Fetch posts error:", err);
    }
  }

  const [followersCount, setFollowersCount] = useState(0)
  const [followingCount, setFollowingCount] = useState(0)
  const [bookmarksCount, setBookmarksCount] = useState(0)
  const [followBrands, setFollowBrands] = useState<FollowBrand[]>([])
  const [followDesigners, setFollowDesigners] = useState<FollowDesigner[]>([])
  const [processingAccount, setProcessingAccount] = useState(false)
  
  const [confirmType, setConfirmType] = useState<"deactivate" | "delete" | null>(null)
  const [statusMessage, setStatusMessage] = useState<StatusMessage | null>(null)

  const handleDeactivate = async () => {
    setProcessingAccount(true)
    setStatusMessage(null)
    
    const { error } = await supabase.from("users").update({ is_active: false }).eq("id", profile?.id)
    setProcessingAccount(false)
    
    if (error) {
      setStatusMessage({ text: error.message, type: "error" })
      return
    }
    await supabase.auth.signOut()
    router.push("/")
  }

  const handleDeleteAccount = async () => {
    setProcessingAccount(true)
    setStatusMessage(null)
    
    const res = await fetch("/api/delete-account", { method: "POST" })
    const data = await res.json()
    setProcessingAccount(false)
    
    if (!res.ok) {
      setStatusMessage({ text: data.error || "アカウント削除に失敗しました", type: "error" })
      return
    }
    await supabase.auth.signOut()
    router.push("/")
  }

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push("/login")
        return
      }

      const { data } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single()
      setProfile(data)

      await fetchPosts(user.id)

      const { count: followers } = await supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("following_id", user.id)
      setFollowersCount(followers || 0)

      const { count: following } = await supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("follower_id", user.id)
      setFollowingCount(following || 0)

      const { count: bookmarks } = await supabase
        .from("bookmarks")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
      setBookmarksCount(bookmarks || 0)

      const { data: followBrandsData } = await supabase
        .from("brand_follows")
        .select(`
          brand_slug,
          brands (
            name,
            name_ja,
            region_slug,
            country_slug
          )
        `)
        .eq("user_id", user.id)
      setFollowBrands((followBrandsData as FollowBrand[]) || [])

      const { data: followDesignersData } = await supabase
        .from("designer_follows")
        .select(`
          designer_slug,
          designers (
            name,
            name_ja,
            region_slug,
            country_slug
          )
        `)
        .eq("user_id", user.id)
      setFollowDesigners((followDesignersData as FollowDesigner[]) || [])

      setLoading(false)
    }

    fetchProfile()
  }, [router])

  if (loading || !profile) {
    return (
      <main className="p-6 sm:p-10 md:p-14 lg:p-16 text-[14px] text-muted font-medium">
        読み込み中...
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="p-6 sm:p-10 md:p-14 lg:p-16 max-w-5xl mx-auto">
        <div className="flex items-center justify-between gap-4 min-h-[40px]">
          <p className="type-label text-[11px] text-subtle tracking-[0.12em] pr-[0.12em] whitespace-nowrap">
            MY PAGE
          </p>
        </div>

        <div className="mt-10 sm:mt-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
            <div>
              <h1 className="type-display text-3xl sm:text-4xl md:text-5xl text-foreground break-words leading-tight">
                Profile
              </h1>
              <p className="mt-2 text-sm sm:text-base tracking-[0.14em] text-muted font-medium">
                プロフィール設定
              </p>
            </div>

            <div className="flex flex-col items-end gap-3">
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => { setConfirmType("deactivate"); setStatusMessage(null); }}
                  disabled={processingAccount}
                  className={`px-4 py-2 text-sm border rounded-full transition-colors disabled:opacity-50 ${
                    confirmType === "deactivate" ? "bg-foreground text-background border-foreground" : "border-border hover:bg-foreground hover:text-background"
                  }`}
                >
                  アカウント停止
                </button>

                <button
                  onClick={() => { setConfirmType("delete"); setStatusMessage(null); }}
                  disabled={processingAccount}
                  className={`px-4 py-2 text-sm border rounded-full transition-colors disabled:opacity-50 ${
                    confirmType === "delete" ? "bg-red-600 text-white border-red-600" : "border-red-500 text-red-600 hover:bg-red-600 hover:text-white"
                  }`}
                >
                  アカウント削除
                </button>
              </div>

              {confirmType && (
                <div className="w-full max-w-xs p-4 rounded-xl border border-border bg-surface text-xs space-y-3 animate-in fade-in duration-200">
                  <p className="text-muted leading-relaxed whitespace-pre-line">
                    {confirmType === "deactivate" 
                      ? "アカウントを停止しますか？\n再ログインでいつでも復帰できます。"
                      : "アカウントを完全に削除します。\n投稿データ等はすべて消去され、復元できません。"}
                  </p>
                  <div className="flex gap-2 justify-end">
                    <button 
                      onClick={() => setConfirmType(null)}
                      className="px-3 py-1.5 border border-border rounded-lg hover:bg-neutral-50"
                    >
                      キャンセル
                    </button>
                    <button 
                      onClick={confirmType === "deactivate" ? handleDeactivate : handleDeleteAccount}
                      disabled={processingAccount}
                      className={`px-3 py-1.5 text-white rounded-lg disabled:opacity-50 ${
                        confirmType === "deactivate" ? "bg-black" : "bg-red-600"
                      }`}
                    >
                      {processingAccount ? "処理中..." : "実行する"}
                    </button>
                  </div>
                </div>
              )}

              {statusMessage && (
                <div className={`text-xs p-3 rounded-xl border w-full max-w-xs ${
                  statusMessage.type === "error" 
                    ? "text-red-500 bg-red-50/50 border-red-200" 
                    : "text-foreground bg-neutral-50 border-border"
                }`}>
                  {statusMessage.text}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-12 sm:mt-14">
          <AvatarUpload userId={profile.id} initialAvatarUrl={profile.avatar_url} />
        </div>

        <div className="mt-14 grid grid-cols-2 md:grid-cols-4 border-t border-b border-border py-8 gap-x-6 gap-y-8">
          <div className="col-span-2 md:col-span-4 border-b border-border pb-6">
            <p className="type-label text-[11px] tracking-[0.12em] text-subtle">EMAIL</p>
            <p className="mt-2 text-lg font-medium tracking-[0.05em]">{profile.email}</p>
          </div>

          <div className="flex flex-col">
            <p className="type-label text-[11px] tracking-[0.12em] text-subtle">POSTS</p>
            <p className="mt-2 text-2xl font-medium">{posts.length}</p>
          </div>

          <Link href={`/users/${profile.id}/followers`} className="flex flex-col hover:opacity-60 transition-opacity">
            <p className="type-label text-[11px] tracking-[0.12em] text-subtle">FOLLOWERS</p>
            <p className="mt-2 text-2xl font-medium">{followersCount}</p>
          </Link>

          <Link href={`/users/${profile.id}/following`} className="flex flex-col hover:opacity-60 transition-opacity">
            <p className="type-label text-[11px] tracking-[0.12em] text-subtle">FOLLOWING</p>
            <p className="mt-2 text-2xl font-medium">{followingCount}</p>
          </Link>

          <Link href="/bookmarks" className="flex flex-col hover:opacity-60 transition-opacity">
            <p className="type-label text-[11px] tracking-[0.12em] text-subtle">BOOKMARKS</p>
            <p className="mt-2 text-2xl font-medium">{bookmarksCount}</p>
          </Link>
        </div>

        <div className="mt-12 sm:mt-14">
          <ProfileForm userId={profile.id} initialUsername={profile.username} initialBio={profile.bio} />
        </div>
      </section>

      <section className="px-6 pb-14 sm:px-10 md:px-14 lg:px-16 max-w-5xl mx-auto space-y-24">
        
        <div className="border-t border-border pt-14">
          <div className="flex flex-col mb-10">
            <h2 className="type-display text-xl sm:text-2xl md:text-3xl text-foreground break-words leading-tight">
              Follow Brands
            </h2>
            <p className="mt-2 text-xs tracking-[0.14em] text-muted font-medium">
              フォロー中のブランド
            </p>
          </div>

          {followBrands.length === 0 ? (
            <p className="text-[14px] text-muted leading-7">フォロー中のブランドはありません</p>
          ) : (
            <div className="flex flex-wrap gap-3">
              {followBrands.map((item) => {
                const brand = item.brands?.[0]
                if (!brand) return null
                return (
                  <Link
                    key={item.brand_slug}
                    href={`/brands/${brand.region_slug}/${brand.country_slug}/${item.brand_slug}`}
                    className="px-5 py-2.5 rounded-full border text-[14px] font-medium tracking-[0.05em] transition-all duration-300 bg-white border-border hover:border-foreground hover:bg-foreground hover:text-background"
                  >
                    {brand.name}
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        <div className="border-t border-border pt-14">
          <div className="flex flex-col mb-10">
            <h2 className="type-display text-xl sm:text-2xl md:text-3xl text-foreground break-words leading-tight">
              Follow Designers
            </h2>
            <p className="mt-2 text-xs tracking-[0.14em] text-muted font-medium">
              フォロー中のデザイナー
            </p>
          </div>

          {followDesigners.length === 0 ? (
            <p className="text-[14px] text-muted leading-7">フォロー中のデザイナーはいません</p>
          ) : (
            <div className="flex flex-wrap gap-3">
              {followDesigners.map((item) => {
                const designer = item.designers?.[0]
                if (!designer) return null
                return (
                  <Link
                    key={item.designer_slug}
                    href={`/designers/${designer.region_slug}/${designer.country_slug}/${item.designer_slug}`}
                    className="px-5 py-2.5 rounded-full border text-[14px] font-medium tracking-[0.05em] transition-all duration-300 bg-white border-border hover:border-foreground hover:bg-foreground hover:text-background"
                  >
                    {designer.name}
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        <div className="border-t border-border pt-14">
          <div className="flex flex-col mb-10">
            <h2 className="type-display text-xl sm:text-2xl md:text-3xl text-foreground break-words leading-tight">
              Create Post
            </h2>
            <p className="mt-2 text-xs tracking-[0.14em] text-muted font-medium">
              新しいポストを作成する
            </p>
          </div>
          
          {profile && (
            <div className="mt-8">
              <CreatePostForm onPostCreated={() => fetchPosts(profile.id)} />
            </div>
          )}
        </div>

        <div className="border-t border-border pt-14 pb-14">
          <div className="flex flex-col mb-10">
            <h2 className="type-display text-xl sm:text-2xl md:text-3xl text-foreground break-words leading-tight">
              My Posts
            </h2>
            <p className="mt-2 text-xs tracking-[0.14em] text-muted font-medium">
              過去のポスト
            </p>
          </div>

          <div className="mt-8 grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-12">
            {posts.map((post) => (
              <div key={post.id} className="group flex flex-col justify-between">
                <div className="space-y-3.5">
                  <Link href={`/posts/${post.id}`} className="block overflow-hidden rounded-2xl border border-border bg-surface">
                    <img
                      src={post.image_urls?.[0]}
                      alt={post.title || "Post Image"}
                      className="w-full aspect-[4/5] object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                    />
                  </Link>
                  <div className="px-1">
                    <p className="text-[15px] sm:text-base font-medium leading-snug text-foreground break-words">
                      {post.title || "無題のポスト"}
                    </p>
                  </div>
                </div>

                <div className="flex gap-6 mt-4 pt-2.5 border-t border-border/30 px-1">
                  <Link href={`/posts/${post.id}`} className="text-xs font-medium text-muted hover:text-foreground hover:underline transition-colors">
                    表示
                  </Link>
                  <Link href={`/edit-post/${post.id}`} className="text-xs font-medium text-subtle hover:text-foreground hover:underline transition-colors">
                    編集
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}