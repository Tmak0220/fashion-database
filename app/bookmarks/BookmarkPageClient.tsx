"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { supabase } from "@/lib/supabase"

type BookmarkPost = {
  bookmark_id: string
  posts: {
    id: string
    title: string | null
    image_urls: string[]
    year: number | null
    season: string | null
    brand_slug: string | null
    designer_slug: string | null
    brands: { name: string } | null
    designers: { name: string } | null
    tags: string[]
  }
}

type FilterType = "all" | "brand" | "designer" | "tag"

export default function BookmarkPageClient() {
  const [bookmarks, setBookmarks] = useState<BookmarkPost[]>([])
  const [isPlusMember, setIsPlusMember] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  const [activeTab, setActiveTab] = useState<FilterType>("all")
  const [selectedSubItem, setSelectedSubItem] = useState<string>("すべて")

  const [isEditing, setIsEditing] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [actionLoading, setActionLoading] = useState(false)

  const fetchBookmarks = async () => {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setIsPlusMember(false)
      return
    }

    setCurrentUserId(user.id)

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
      return
    }

    const { data, error } = await supabase
      .from("bookmarks")
      .select(`
        id,
        posts:post_id (
          id,
          title,
          image_urls,
          year,
          season,
          brand_slug,
          designer_slug
        )
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Bookmark fetch error:", error.message)
      return
    }

    if (data && data.length > 0) {
      const formattedData: BookmarkPost[] = await Promise.all(
        data
          .filter((item: any) => item.posts)
          .map(async (item: any) => {
            const rawPost = item.posts
            let brandInfo = null
            let designerInfo = null
            let tagNames: string[] = []

            if (rawPost.brand_slug) {
              const { data: brandData } = await supabase
                .from("brands")
                .select("name")
                .eq("slug", rawPost.brand_slug)
                .maybeSingle()
              if (brandData) brandInfo = { name: brandData.name }
            }

            if (rawPost.designer_slug) {
              const { data: designerData } = await supabase
                .from("designers")
                .select("name")
                .eq("slug", rawPost.designer_slug)
                .maybeSingle()
              if (designerData) designerInfo = { name: designerData.name }
            }

            const { data: postTagsData } = await supabase
              .from("post_tags")
              .select("tags ( name )")
              .eq("post_id", rawPost.id)

            if (postTagsData) {
              tagNames = postTagsData
                .map((pt: any) => pt.tags?.name)
                .filter(Boolean) as string[]
            }

            return {
              bookmark_id: item.id,
              posts: {
                id: rawPost.id,
                title: rawPost.title,
                image_urls: rawPost.image_urls,
                year: rawPost.year,
                season: rawPost.season,
                brand_slug: rawPost.brand_slug,
                designer_slug: rawPost.designer_slug,
                brands: brandInfo,
                designers: designerInfo,
                tags: tagNames
              }
            }
          })
      )
      setBookmarks(formattedData)
    } else {
      setBookmarks([])
    }
  }

  useEffect(() => {
    fetchBookmarks()
  }, [])

  useEffect(() => {
    setSelectedSubItem("すべて")
  }, [activeTab])

  const handleSingleDelete = async (bookmarkId: string) => {
    if (actionLoading) return
    setActionLoading(true)
    const { error } = await supabase.from("bookmarks").delete().eq("id", bookmarkId)
    if (!error) {
      setBookmarks(prev => prev.filter(b => b.bookmark_id !== bookmarkId))
      setSelectedIds(prev => prev.filter(id => id !== bookmarkId))
    }
    setActionLoading(false)
  }

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0 || actionLoading) return
    setActionLoading(true)
    const { error } = await supabase.from("bookmarks").delete().in("id", selectedIds)
    if (!error) {
      setBookmarks(prev => prev.filter(b => !selectedIds.includes(b.bookmark_id)))
      setSelectedIds([])
      setIsEditing(false)
    }
    setActionLoading(false)
  }

  const handleSelectToggle = (bookmarkId: string) => {
    setSelectedIds(prev => 
      prev.includes(bookmarkId) ? prev.filter(id => id !== bookmarkId) : [...prev, bookmarkId]
    )
  }

  if (!isPlusMember) {
    return (
      <main className="max-w-6xl mx-auto p-10 md:p-14 lg:p-16 text-center flex flex-col items-center justify-center min-h-[60vh]">
        <div className="max-w-md w-full p-8 border border-border bg-surface rounded-2xl shadow-xl">
          <h1 className="text-base font-semibold tracking-[0.05em] text-foreground uppercase">MEMBER限定機能</h1>
          <p className="mt-4 text-xs text-muted leading-relaxed">アーカイブを保存し、ブランドやタグごとに一覧管理できる機能です。利用にはMEMBER登録が必要です。</p>
          <Link href="/members" className="mt-8 block w-full text-center bg-black text-white font-medium rounded-xl px-4 py-3 text-[12px] transition-colors duration-300 hover:bg-neutral-800">MEMBERに登録する</Link>
          <Link href="/" className="mt-4 inline-block text-[11px] text-subtle hover:text-foreground transition-colors duration-300">トップページに戻る</Link>
        </div>
      </main>
    )
  }

  const subFilterItems = ["すべて"]
  if (activeTab === "brand") {
    subFilterItems.push(...Array.from(new Set(bookmarks.map(b => b.posts.brands?.name).filter(Boolean) as string[])))
  } else if (activeTab === "designer") {
    subFilterItems.push(...Array.from(new Set(bookmarks.map(b => b.posts.designers?.name).filter(Boolean) as string[])))
  } else if (activeTab === "tag") {
    subFilterItems.push(...Array.from(new Set(bookmarks.flatMap(b => b.posts.tags))))
  }

  const filteredBookmarks = bookmarks.filter(item => {
    if (activeTab === "all") return true
    if (activeTab === "brand") {
      return selectedSubItem === "すべて" ? !!item.posts.brands : item.posts.brands?.name === selectedSubItem
    }
    if (activeTab === "designer") {
      return selectedSubItem === "すべて" ? !!item.posts.designers : item.posts.designers?.name === selectedSubItem
    }
    if (activeTab === "tag") {
      return selectedSubItem === "すべて" ? item.posts.tags.length > 0 : item.posts.tags.includes(selectedSubItem)
    }
    return true
  })

  return (
    <main className="max-w-6xl mx-auto p-6 sm:p-10 md:p-14 lg:p-16">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl tracking-[0.12em] font-medium text-foreground uppercase flex flex-col gap-1">
            BOOKMARK
            <span className="text-[10px] tracking-[0.05em] font-normal text-muted lowercase">
              ブックマーク
            </span>
          </h1>
          <p className="text-xs text-subtle font-medium mt-3">計 {bookmarks.length} 個のアーカイブ</p>
        </div>
        
        {bookmarks.length > 0 && (
          <div className="flex items-center gap-3">
            {isEditing && selectedIds.length > 0 && (
              <button onClick={handleBulkDelete} disabled={actionLoading} className="px-4 py-2 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition-all duration-200 shadow-sm">
                選択した {selectedIds.length} 件を削除
              </button>
            )}
            <button onClick={() => { setIsEditing(!isEditing); setSelectedIds([]); }} className={`px-4 py-2 border rounded-xl text-xs font-medium transition-all duration-200 ${isEditing ? "bg-black text-white border-black" : "bg-surface text-muted border-border hover:bg-neutral-50"}`}>
              {isEditing ? "編集を完了" : "一括操作"}
            </button>
          </div>
        )}
      </div>

      <div className="mt-8 flex gap-6 border-b border-border text-sm overflow-x-auto no-scrollbar">
        {[ { id: "all", label: "すべて" }, { id: "brand", label: "ブランド別" }, { id: "designer", label: "デザイナー別" }, { id: "tag", label: "タグ別" } ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as FilterType)} className={`pb-3 font-medium tracking-wider transition-colors relative whitespace-nowrap ${activeTab === tab.id ? "text-foreground" : "text-subtle hover:text-foreground"}`}>
            {tab.label}
            {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black" />}
          </button>
        ))}
      </div>

      {subFilterItems.length > 1 && (
        <div className="mt-6 flex flex-wrap gap-2 opacity-0 animate-[fadeIn_0.3s_ease-out_forwards]">
          {subFilterItems.map(item => (
            <button key={item} onClick={() => setSelectedSubItem(item)} className={`px-3 py-1.5 rounded-full text-xs transition-colors font-medium border ${selectedSubItem === item ? "bg-black text-white border-black" : "bg-surface text-muted border-border hover:bg-neutral-50"}`}>
              {item}
            </button>
          ))}
        </div>
      )}

      {filteredBookmarks.length === 0 ? (
        <div className="mt-20 text-center text-xs text-subtle">該当するアイテムがありません。</div>
      ) : (
        <div className="mt-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8 sm:gap-6">
          {filteredBookmarks.map((item) => {
            const post = item.posts
            const urlSlug = `${post.brand_slug || "archive"}-${post.id}`
            const isSelected = selectedIds.includes(item.bookmark_id)

            return (
              <div 
                key={item.bookmark_id} 
                className={`relative group block transition-all duration-300 ${
                  isEditing && !isSelected ? "opacity-60 scale-[0.98]" : "opacity-100"
                }`}
              >
                {isEditing && (
                  <div className="absolute top-3 left-3 z-30">
                    <input 
                      type="checkbox" 
                      checked={isSelected} 
                      onChange={() => handleSelectToggle(item.bookmark_id)} 
                      className="w-5 h-5 rounded-md border-neutral-300 text-black focus:ring-black cursor-pointer bg-white/90 backdrop-blur-sm transition-transform duration-200 active:scale-95" 
                    />
                  </div>
                )}

                {isEditing && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleSingleDelete(item.bookmark_id);
                    }}
                    disabled={actionLoading}
                    className="absolute top-3 right-3 z-30 w-7 h-7 flex items-center justify-center rounded-full bg-white/90 backdrop-blur-sm border border-neutral-200 text-neutral-500 hover:text-red-500 hover:border-red-200 transition-all shadow-sm"
                    title="削除"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}

                <Link 
                  href={isEditing ? "#" : `/posts/${urlSlug}`} 
                  onClick={(e) => {
                    if (isEditing) {
                      e.preventDefault();
                      handleSelectToggle(item.bookmark_id);
                    }
                  }} 
                  className="cursor-pointer"
                >
                  <article className="space-y-3">
                    <div className={`overflow-hidden rounded-2xl border bg-neutral-50 aspect-[4/5] relative transition-all duration-300 ${
                      isSelected ? "border-black ring-1 ring-black shadow-md" : "border-border"
                    }`}>
                      {post.image_urls?.[0] && (
                        <Image 
                          src={post.image_urls[0]} 
                          alt={post.title || ""} 
                          fill 
                          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw" 
                          className={`object-cover transition duration-500 ${
                            isEditing ? "" : "group-hover:scale-[1.03]"
                          }`} 
                        />
                      )}
                    </div>
                    <div className="space-y-1 px-1">
                      {post.brands?.name && <p className="text-[10px] sm:text-[11px] font-medium tracking-wide uppercase text-subtle">{post.brands.name}</p>}
                      <p className="text-xs text-foreground font-normal line-clamp-1 group-hover:text-neutral-600 transition-colors">{post.title || "Untitled"}</p>
                      {post.year && <p className="text-[10px] text-muted">{post.year} {post.season || ""}</p>}
                    </div>
                  </article>
                </Link>
              </div>
            )
          })}
        </div>
      )}
    </main>
  )
}