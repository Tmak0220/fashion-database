"use client"

import { useEffect, useState } from "react"
import Link from "@/components/LocalizedLink"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { useLocale } from "@/context/LocaleContext"

import ProfileForm from "@/components/ProfileForm"
import AvatarUpload from "@/components/AvatarUpload"
import CreatePostForm from "@/components/CreatePostForm"
import MyPageLoading from "./loading"

type Profile = {
  id: string
  email: string
  username: string | null
  display_name: string | null
  bio: string | null
  avatar_url: string | null
}

type Post = {
  id: string
  image_urls: string[]
  title: string | null
  brands: { slug: string } | null
}

type FollowBrand = {
  brand_id: number
  brands: {
    slug: string
    name: string
    name_ja: string | null
    region_slug: string
    country_slug: string
  }[] | null
}

type FollowDesigner = {
  designer_id: number
  designers: {
    slug: string
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
  const { localizePath } = useLocale()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  
  const fetchPosts = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("posts")
        .select("id, image_urls, title, brands!posts_brand_id_fkey(slug)")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
      if (error) throw error
      setPosts((data || []).map((post) => ({
        ...post,
        brands: Array.isArray(post.brands) ? post.brands[0] || null : post.brands,
      })))
    } catch (err) {
      console.error("Fetch posts error:", err)
    }
  }

  const [followersCount, setFollowersCount] = useState(0)
  const [followingCount, setFollowingCount] = useState(0)
  const [bookmarksCount, setBookmarksCount] = useState(0)
  const [followBrands, setFollowBrands] = useState<FollowBrand[]>([])
  const [followDesigners, setFollowDesigners] = useState<FollowDesigner[]>([])
  const [processingAccount, setProcessingAccount] = useState(false)
  
  const [confirmType, setConfirmType] = useState<"delete" | null>(null)
  const [statusMessage, setStatusMessage] = useState<StatusMessage | null>(null)
  const [deleteConfirmation, setDeleteConfirmation] = useState("")

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
    router.push(localizePath("/"))
  }

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push(localizePath("/login"))
        return
      }

      const { data, error: profileError } = await supabase
        .from("profiles")
        .select("id, username, display_name, bio, avatar_url")
        .eq("id", user.id)
        .single()
      if (profileError || !data) {
        setStatusMessage({ text: "プロフィールの取得に失敗しました", type: "error" })
        setLoading(false)
        return
      }
      setProfile({ ...data, email: user.email || "" })

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
          brand_id,
          brands!brand_follows_brand_id_fkey (
            slug,
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
          designer_id,
          designers!designer_follows_designer_id_fkey (
            slug,
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
  }, [localizePath, router])

  if (loading || !profile) {
    return <MyPageLoading />
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
          <div>
            <div>
              <h1 className="type-display text-3xl sm:text-4xl md:text-5xl text-foreground break-words leading-tight">
                Profile
              </h1>
              <p className="mt-2 text-sm sm:text-base tracking-[0.14em] text-muted font-medium">
                プロフィール設定
              </p>
            </div>

          </div>
        </div>

        <div className="mt-12 sm:mt-14">
          <AvatarUpload userId={profile.id} initialAvatarUrl={profile.avatar_url} username={profile.username} displayName={profile.display_name} />
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

          <Link 
            href={profile.username ? `/users/${profile.username}` : "#"} 
            className="flex flex-col hover:opacity-60 transition-opacity"
          >
            <p className="type-label text-[11px] tracking-[0.12em] text-subtle">FOLLOWERS</p>
            <p className="mt-2 text-2xl font-medium">{followersCount}</p>
          </Link>

          <Link 
            href={profile.username ? `/users/${profile.username}` : "#"} 
            className="flex flex-col hover:opacity-60 transition-opacity"
          >
            <p className="type-label text-[11px] tracking-[0.12em] text-subtle">FOLLOWING</p>
            <p className="mt-2 text-2xl font-medium">{followingCount}</p>
          </Link>

          <Link href="/bookmarks" className="flex flex-col hover:opacity-60 transition-opacity">
            <p className="type-label text-[11px] tracking-[0.12em] text-subtle">BOOKMARKS</p>
            <p className="mt-2 text-2xl font-medium">{bookmarksCount}</p>
          </Link>
        </div>

        <div className="mt-12 sm:mt-14">
          <ProfileForm 
            userId={profile.id} 
            initialUsername={profile.username} 
            initialDisplayName={profile.display_name} 
            initialBio={profile.bio} 
          />
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
                    key={item.brand_id}
                    href={`/brands/${brand.region_slug}/${brand.country_slug}/${brand.slug}`}
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
                    key={item.designer_id}
                    href={`/designers/${designer.region_slug}/${designer.country_slug}/${designer.slug}`}
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
              {posts.map((post) => {
                const prefix = post.brands?.slug || "archive"
                return (
                  <div key={post.id} className="group flex flex-col justify-between">
                    <div className="space-y-3.5">
                      <Link 
                        href={`/posts/${prefix}-${post.id}`} 
                        className="block overflow-hidden rounded-2xl border border-border bg-surface relative w-full aspect-[4/5]"
                      >
                        {post.image_urls?.[0] && (
                          <Image
                            src={post.image_urls[0]}
                            alt={post.title || "Post Image"}
                            fill
                            sizes="(max-width: 768px) 50vw, 33vw"
                            className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                          />
                        )}
                      </Link>
                      <div className="px-1">
                        <p className="text-[15px] sm:text-base font-medium leading-snug text-foreground break-words">
                          {post.title || "無題のポスト"}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-6 mt-4 pt-2.5 border-t border-border/30 px-1">
                      <Link href={`/posts/${prefix}-${post.id}`} className="text-xs font-medium text-muted hover:text-foreground hover:underline transition-colors">
                        表示
                      </Link>
                      <Link href={`/edit-post/${post.id}`} className="text-xs font-medium text-subtle hover:text-foreground hover:underline transition-colors">
                        編集
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
        </div>

        <div className="border-t border-border/60 pt-8 pb-14">
          <details className="group max-w-xl">
            <summary className="cursor-pointer list-none text-[11px] tracking-[0.12em] text-subtle hover:text-muted transition-colors">
              アカウント管理
            </summary>
            <div className="mt-6 rounded-2xl border border-border/70 bg-surface p-5 sm:p-6">
              <p className="text-xs leading-6 text-muted">
                アカウントを削除すると、投稿・画像・プロフィール・保存情報がすべて削除されます。
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  onClick={() => { setConfirmType("delete"); setDeleteConfirmation(""); setStatusMessage(null) }}
                  disabled={processingAccount}
                  className="text-xs text-subtle underline underline-offset-4 hover:text-red-600 disabled:opacity-50"
                >
                  アカウントを削除
                </button>
              </div>

              {confirmType && (
                <div className="mt-6 border-t border-border pt-5 text-xs space-y-4">
                  <p className="text-muted leading-6 whitespace-pre-line">
                    投稿、画像、プロフィール、ブックマーク、いいね、フォロー情報を完全に削除します。
                    {"\n"}この操作は取り消せません。続けるには「削除」と入力してください。
                  </p>
                  <input
                    value={deleteConfirmation}
                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                    placeholder="削除"
                    className="w-full max-w-xs rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-red-300"
                  />
                  <div className="flex gap-2">
                    <button onClick={() => { setConfirmType(null); setDeleteConfirmation("") }} className="rounded-lg border border-border px-3 py-2 text-muted hover:text-foreground">
                      キャンセル
                    </button>
                    <button
                      onClick={handleDeleteAccount}
                      disabled={processingAccount || deleteConfirmation !== "削除"}
                      className="rounded-lg bg-red-600 px-3 py-2 text-white disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {processingAccount ? "処理中..." : "完全に削除する"}
                    </button>
                  </div>
                </div>
              )}

              {statusMessage && (
                <div className={`mt-5 text-xs rounded-xl border p-3 ${statusMessage.type === "error" ? "border-red-200 bg-red-50/50 text-red-600" : "border-border text-foreground"}`}>
                  {statusMessage.text}
                </div>
              )}
            </div>
          </details>
        </div>
      </section>
    </main>
  )
}
