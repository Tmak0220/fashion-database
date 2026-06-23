"use client"

import { useEffect, useState, useLayoutEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import EditLoading from "./loading"

type Post = {
  id: string
  title: string | null
  description: string | null
  brand_slug: string | null
  collection_slug: string | null
  season_slug: string | null
  designer_slug: string | null
  image_urls: string[]
  user_id: string
}

type Tag = {
  id: string | number
  name: string
  slug: string
}

type StatusMessage = {
  text: string
  type: "error" | "success"
}

export default function EditPostPage() {
  const params = useParams()
  const router = useRouter()
  const postId = params.id as string

  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isAuthChecked, setIsAuthChecked] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [post, setPost] = useState<Post | null>(null)

  const [statusMessage, setStatusMessage] = useState<StatusMessage | null>(null)

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [brandSlug, setBrandSlug] = useState("")
  const [year, setYear] = useState("")
  const [yearError, setYearError] = useState("")
  const [season, setSeason] = useState<"ss" | "fw" | "">("")
  const [collectionSlug, setCollectionSlug] = useState("")
  const [seasonSlug, setSeasonSlug] = useState("")
  const [designerSlug, setDesignerSlug] = useState("")
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  useLayoutEffect(() => {
    window.scrollTo(0, 0)
  }, [])
  
  useEffect(() => {
    const fetchPostAndVerify = async () => {
      if (!postId) return

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setIsAuthorized(false)
        setIsAuthChecked(true)
        return
      }

      const { data: profile } = await supabase
        .from("users")
        .select("plus_member")
        .eq("id", user.id)
        .single()

      if (!profile?.plus_member) {
        setIsAuthorized(false)
        setIsAuthChecked(true)
        return
      }

      const { data: postData, error: postError } = await supabase
        .from("posts")
        .select(`
          *,
          users (id, username, avatar_url)
        `)
        .eq("id", postId)
        .single()

      if (postError || !postData) {
        console.error("Fetch Error:", postError?.message)
        setIsAuthorized(false)
        setIsAuthChecked(true)
        return
      }

      if (postData.user_id !== user.id) {
        setIsAuthorized(false)
        setIsAuthChecked(true)
        return
      }

      setIsAuthorized(true)

      const { data: tagsData } = await supabase.from("tags").select("*").order("name")
      const { data: postTagsData } = await supabase.from("post_tags").select("tag_id").eq("post_id", postId)

      setPost(postData)
      setTitle(postData.title || "")
      setDescription(postData.description || "")
      setBrandSlug(postData.brand_slug || "")
      setDesignerSlug(postData.designer_slug || "")
      setImageUrls(postData.image_urls || [])
      setTags(tagsData || [])

      setYear(postData.year ? String(postData.year) : "")
      setSeason((postData.season as "ss" | "fw") || "")

      const currentTags = postTagsData?.map((item) => String(item.tag_id)) || []
      setSelectedTags(currentTags)
      
      setIsAuthChecked(true)
    }

    fetchPostAndVerify()
  }, [postId])

  useEffect(() => {
    if (!season) {
      setSeasonSlug("")
      setCollectionSlug("")
      return
    }
  
    const generatedSeasonSlug = year
      ? `${year}-${season}`
      : season
  
    setSeasonSlug(generatedSeasonSlug)
  
    if (brandSlug.trim()) {
      setCollectionSlug(`${brandSlug.trim()}-${generatedSeasonSlug}`)
    } else {
      setCollectionSlug(generatedSeasonSlug)
    }
  }, [brandSlug, year, season])

  const toggleTag = (rawTagId: string | number) => {
    const tagId = String(rawTagId)
    setSelectedTags((prev) => {
      if (prev.includes(tagId)) {
        return prev.filter((id) => id !== tagId)
      }
      return [...prev, tagId]
    })
  }

  const handleSeasonSelect = (type: "ss" | "fw") => {
    setSeason((prev) => (prev === type ? "" : type))
  }

  const handleYearChange = (val: string) => {
    setYear(val)
    if (!val) {
      setYearError("")
      return
    }
    const isHalfWidthNumber = /^[0-9]+$/.test(val)
    if (!isHalfWidthNumber) {
      setYearError("半角数字で入力して下さい")
    } else {
      setYearError("")
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setStatusMessage(null)

    if (imageUrls.length + files.length > 2) {
      setStatusMessage({ text: "画像は最大2枚までアップロード可能です。", type: "error" })
      return
    }

    setUploading(true)
    const uploadedUrls: string[] = []

    for (const file of Array.from(files)) {
      const formData = new FormData()
      formData.append("file", file)

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })
      const data = await res.json()

      if (!res.ok) {
        setStatusMessage({ text: "画像のアップロードに失敗しました。", type: "error" })
        continue
      }
      uploadedUrls.push(data.url)
    }

    setImageUrls((prev) => [...prev, ...uploadedUrls])
    setUploading(false)
  }

  const removeImage = (targetUrl: string) => {
    setImageUrls((prev) => prev.filter((url) => url !== targetUrl))
  }

  const handleUpdate = async () => {
    setStatusMessage(null)

    if (yearError) {
      setStatusMessage({ text: "YEARの入力内容を確認してください。", type: "error" })
      return
    }
    if (imageUrls.length === 0) {
      setStatusMessage({ text: "少なくとも1枚の画像が必要です。", type: "error" })
      return
    }

    setSaving(true)
    
    const yearValue = year ? parseInt(year, 10) : null
    const seasonValue = season || null
    const seasonSlug = (yearValue && season) ? `${yearValue}-${season}` : null
    
    let finalBrandSlug = brandSlug.trim().toLowerCase() || null
    let finalDesignerSlug = designerSlug.trim() || null

    if (brandSlug.trim()) {
      const { data: b } = await supabase.from("brands").select("slug")
        .or(`slug.eq.${brandSlug.trim()},name.eq.${brandSlug.trim()}`).maybeSingle()
      if (b?.slug) finalBrandSlug = b.slug
    }

    if (designerSlug.trim()) {
      const { data: d } = await supabase.from("designers").select("slug")
        .or(`slug.eq.${designerSlug.trim()},name.eq.${designerSlug.trim()}`).maybeSingle()
      if (d?.slug) finalDesignerSlug = d.slug
    }

    const finalCollectionSlug = seasonSlug 
      ? (finalBrandSlug ? `${finalBrandSlug}-${seasonSlug}` : seasonSlug) 
      : null

    const { error: postError } = await supabase
      .from("posts")
      .update({
        title,
        description,
        brand_slug: finalBrandSlug,
        designer_slug: finalDesignerSlug,
        collection_slug: finalCollectionSlug,
        season_slug: seasonSlug,
        season: season,
        year: yearValue,
        image_urls: imageUrls,
      })
      .eq("id", postId)

    if (postError) {
      console.error(postError)
      setSaving(false)
      setStatusMessage({ text: "更新に失敗しました。", type: "error" })
      return
    }

    await supabase.from("post_tags").delete().eq("post_id", postId)
    
    if (selectedTags.length > 0) {
      const { error: insertError } = await supabase.from("post_tags").insert(
        selectedTags.map((tagId) => ({ post_id: postId, tag_id: tagId }))
      )
      
      if (insertError) {
        console.error("タグ保存エラー:", insertError)
        setStatusMessage({ text: "タグの保存に失敗しました。", type: "error" })
        setSaving(false)
        return
      }
    }

    setSaving(false)
    setStatusMessage({ text: "投稿を更新しました", type: "success" })
    
    setTimeout(() => {
      router.push("/mypage")
    }, 1000)
  }

  const handleDelete = async () => {
    setStatusMessage(null)
    if (!window.confirm("この投稿を削除しますか？\n（画像も同時に完全に削除されます）")) return
    
    setDeleting(true)

    try {
      const res = await fetch("/api/delete-post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ postId }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "削除に失敗しました。")
      }

      setStatusMessage({ text: "投稿と画像を削除しました", type: "success" })
      
      setTimeout(() => {
        router.push("/mypage")
      }, 1000)
    } catch (err: any) {
      console.error(err)
      setStatusMessage({ text: err.message || "削除に失敗しました。", type: "error" })
    } finally {
      setDeleting(false)
    }
  }

  if (!isAuthChecked) {
    return <EditLoading />
  }

  if (!isAuthorized) {
    return (
      <main className="max-w-6xl mx-auto p-10 md:p-14 lg:p-16 text-center flex flex-col items-center justify-center min-h-[60vh]">
        <div className="max-w-md w-full p-8 border border-border bg-surface rounded-2xl shadow-xl">
          <h1 className="text-base font-semibold tracking-[0.05em] text-foreground uppercase">
            MEMBER限定機能
          </h1>
          <p className="mt-4 text-xs text-muted leading-relaxed">
            投稿の編集、管理および削除機能利用するには、投稿を所有しているMEMBERアカウントでのログインが必要です。
          </p>
          <Link
            href="/members"
            className="mt-8 block w-full text-center bg-black text-white font-medium rounded-xl px-4 py-3 text-[12px] transition-colors duration-300 hover:bg-neutral-800"
          >
            MEMBERに登録する
          </Link>
          <Link 
            href="/" 
            className="mt-4 inline-block text-[11px] text-subtle hover:text-foreground transition-colors duration-300"
          >
            トップページに戻る
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="p-6 sm:p-10 md:p-14 lg:p-16 max-w-5xl">
        <div className="flex items-center justify-between gap-4 min-h-[40px]">
          <p className="type-label text-[11px] text-subtle tracking-[0.12em] pr-[0.12em] whitespace-nowrap">
            EDIT POST
          </p>
        </div>

        <div className="mt-10 sm:mt-8 flex flex-col">
          <h1 className="type-display text-3xl sm:text-4xl md:text-5xl text-foreground break-words leading-tight">
            Edit
          </h1>
          <p className="mt-2 text-sm sm:text-base tracking-[0.14em] text-muted font-medium">
            投稿内容の編集
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl">
          {imageUrls.map((url, index) => (
            <div key={url} className="space-y-3">
              <div className="relative overflow-hidden rounded-2xl border border-border bg-surface w-full aspect-[4/5]">
                <Image
                  src={url}
                  alt={`Preview ${index + 1}`}
                  fill
                  sizes="(max-width: 640px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
              <button type="button" onClick={() => removeImage(url)} className="text-xs underline text-red-500 hover:text-red-700 transition-colors pl-1">
                削除する
              </button>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <label className="inline-flex items-center gap-4 cursor-pointer">
            <span className="type-label text-sm px-6 py-4 border border-border rounded-xl bg-surface text-foreground hover:bg-foreground hover:text-background transition-colors duration-300">
              ファイルを追加
            </span>
            <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
          </label>
          {uploading && <p className="mt-4 text-sm text-muted">アップロード中...</p>}
        </div>

        <div className="mt-14 space-y-8 max-w-3xl">
          <div>
            <p className="text-sm mb-2 tracking-[0.14em] text-muted font-medium">TITLE</p>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border border-border rounded-xl px-4 py-3 bg-surface text-foreground" />
          </div>

          <div>
            <p className="text-sm mb-2 tracking-[0.14em] text-muted font-medium">DESCRIPTION</p>
            <textarea rows={6} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border border-border rounded-xl px-4 py-3 bg-surface text-foreground" />
          </div>

          <div>
            <p className="text-sm mb-2 tracking-[0.14em] text-muted font-medium">BRAND</p>
            <input value={brandSlug} onChange={(e) => setBrandSlug(e.target.value)} placeholder="gucci または グッチ" className="w-full border border-border rounded-xl px-4 py-3 bg-surface text-foreground" />
            <p className="mt-2 text-xs text-muted">登録済みのキーワードは、関連ブランドに自動的にリンクされます</p>
          </div>

          <div>
            <p className="text-sm mb-2 tracking-[0.14em] text-muted font-medium">YEAR</p>
            <input value={year} onChange={(e) => handleYearChange(e.target.value)} placeholder="1999" className={`w-full border rounded-xl px-4 py-3 transition-colors ${yearError ? "border-red-500 bg-red-50/30 focus:outline-red-500" : "border-border bg-surface text-foreground"}`} />
            {yearError && <p className="mt-2 text-xs text-red-500 font-medium">{yearError}</p>}
          </div>

          <div>
            <p className="text-sm mb-4 tracking-[0.14em] text-muted font-medium">SEASON</p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => handleSeasonSelect("ss")}
                className={`px-5 py-3 rounded-xl border text-sm transition ${
                  season === "ss" ? "bg-foreground text-background border-foreground" : "bg-surface border-border text-muted"
                }`}
              >
                SS
              </button>
              <button
                type="button"
                onClick={() => handleSeasonSelect("fw")}
                className={`px-5 py-3 rounded-xl border text-sm transition ${
                  season === "fw" ? "bg-foreground text-background border-foreground" : "bg-surface border-border text-muted"
                }`}
              >
                FW
              </button>
            </div>
          </div>

          <div>
            <p className="text-sm mb-2 tracking-[0.14em] text-muted font-medium">DESIGNER</p>
            <input value={designerSlug} onChange={(e) => setDesignerSlug(e.target.value)} placeholder="tom-ford または トムフォード" className="w-full border border-border rounded-xl px-4 py-3 bg-surface text-foreground" />
            <p className="mt-2 text-xs text-muted">登録済みのキーワードは、関連デザイナーに自動的にリンクされます</p>
          </div>

          <div>
            <p className="text-sm mb-4 tracking-[0.14em] text-muted font-medium">TAGS</p>
            <div className="flex flex-wrap gap-3">
              {tags.map((tag) => {
                const active = selectedTags.includes(String(tag.id))
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                    className={`px-5 py-2.5 rounded-full border text-[14px] font-medium tracking-[0.05em] transition-all duration-300 ${
                      active
                        ? "bg-foreground text-background border-foreground"
                        : "bg-surface border-border text-muted hover:border-foreground"
                    }`}
                  >
                    {tag.name}
                  </button>
                )
              })}
            </div>
          </div>

          {statusMessage && (
            <div className={`text-xs p-4 rounded-xl border ${
              statusMessage.type === "error" 
                ? "text-red-500 bg-red-50/50 border-red-200" 
                : "text-foreground bg-neutral-50 border-border"
            }`}>
              {statusMessage.text}
            </div>
          )}

          <div className="flex gap-4 pt-2">
            <button onClick={handleUpdate} disabled={saving} className="border border-border rounded-xl px-6 py-4 hover:bg-foreground hover:text-background transition bg-surface font-medium text-[14px]">
              {saving ? "変更を保存中..." : "変更を保存する"}
            </button>
            <button onClick={handleDelete} disabled={deleting} className="border border-red-500 text-red-500 rounded-xl px-6 py-4 hover:bg-red-500 hover:text-white transition bg-surface font-medium text-[14px]">
              {deleting ? "削除中..." : "投稿を削除する"}
            </button>
          </div>
        </div>
      </section>
    </main>
  )
}