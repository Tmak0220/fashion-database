"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

type Post = {
  id: string
  title: string | null
  description: string | null
  brand_slug: string | null
  collection_slug: string | null
  season_slug: string | null
  designer_slug: string | null
  image_urls: string[]
}

type Tag = {
  id: string | number
  name: string
  slug: string
}

export default function EditPostPage() {
  const params = useParams()
  const router = useRouter()
  const postId = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [post, setPost] = useState<Post | null>(null)

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [brandSlug, setBrandSlug] = useState("")
  const [year, setYear] = useState("")
  const [yearError, setYearError] = useState("")
  const [seasonType, setSeasonType] = useState<"ss" | "fw" | "">("")
  const [collectionSlug, setCollectionSlug] = useState("")
  const [seasonSlug, setSeasonSlug] = useState("")
  const [designerSlug, setDesignerSlug] = useState("")
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  useEffect(() => {
    const fetchPost = async () => {
      if (!postId) return

      const [postRes, tagsRes, postTagsRes] = await Promise.all([
        supabase.from("posts").select("*").eq("id", postId).single(),
        supabase.from("tags").select("*").order("name"),
        supabase.from("post_tags").select("tag_id").eq("post_id", postId),
      ])

      if (postRes.error || !postRes.data) {
        console.error(postRes.error)
        setLoading(false)
        return
      }

      const data = postRes.data
      setPost(data)
      setTitle(data.title || "")
      setDescription(data.description || "")
      setBrandSlug(data.brand_slug || "")
      setDesignerSlug(data.designer_slug || "")
      setImageUrls(data.image_urls || [])
      setTags(tagsRes.data || [])

      setYear(data.year ? String(data.year) : "")
      setSeasonType((data.season as "ss" | "fw") || "")

      const currentTags = postTagsRes.data?.map((item) => String(item.tag_id)) || []
      setSelectedTags(currentTags)
      setLoading(false)
    }

    fetchPost()
  }, [postId])

  useEffect(() => {
    if (!seasonType) {
      setSeasonSlug("")
      setCollectionSlug("")
      return
    }
  
    const generatedSeasonSlug = year
      ? `${year}-${seasonType}`
      : seasonType
  
    setSeasonSlug(generatedSeasonSlug)
  
    if (brandSlug.trim()) {
      setCollectionSlug(`${brandSlug.trim()}-${generatedSeasonSlug}`)
    } else {
      setCollectionSlug(generatedSeasonSlug)
    }
  }, [brandSlug, year, seasonType])

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
    setSeasonType((prev) => (prev === type ? "" : type))
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

    if (imageUrls.length + files.length > 2) {
      alert("画像は最大2枚までアップロード可能です。")
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
        alert("画像のアップロードに失敗しました。")
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
    if (yearError) return alert("YEARの入力内容を確認してください。")
    if (imageUrls.length === 0) return alert("少なくとも1枚の画像が必要です。")

    setSaving(true)
    
    const yearValue = year ? parseInt(year, 10) : null
    const seasonType = seasonType || null
    const seasonSlug = (yearValue && seasonType) ? `${yearValue}-${seasonType}` : null
    
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
        season: seasonType,
        year: yearValue,
        image_urls: imageUrls,
      })
      .eq("id", postId)

    if (postError) {
      console.error(postError)
      setSaving(false)
      alert("更新に失敗しました。")
      return
    }

    await supabase.from("post_tags").delete().eq("post_id", postId)
    if (selectedTags.length > 0) {
      await supabase.from("post_tags").insert(
        selectedTags.map((tagId) => ({ post_id: postId, tag_id: tagId }))
      )
    }

    setSaving(false)
    alert("投稿を更新しました")
    router.push("/mypage")
  }

  const handleDelete = async () => {
    const confirmed = window.confirm("この投稿を削除しますか？")
    if (!confirmed) return

    setDeleting(true)

    const res = await fetch("/api/delete-post", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId }),
    })
    const data = await res.json()

    if (!res.ok) {
      setDeleting(false)
      alert("削除に失敗しました。")
      return
    }

    alert("投稿を削除しました")
    router.push("/mypage")
  }

  if (loading || !post) {
    return (
      <main className="p-6 sm:p-10 md:p-14 lg:p-16 text-[14px] text-muted font-medium">
        読み込み中...
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
              <div className="overflow-hidden rounded-2xl border border-border bg-surface">
                <img src={url} alt={`Preview ${index + 1}`} className="w-full aspect-[4/5] object-cover" />
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
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border border-border rounded-xl px-4 py-3 bg-white" />
          </div>

          <div>
            <p className="text-sm mb-2 tracking-[0.14em] text-muted font-medium">DESCRIPTION</p>
            <textarea rows={6} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border border-border rounded-xl px-4 py-3 bg-white" />
          </div>

          <div>
            <p className="text-sm mb-2 tracking-[0.14em] text-muted font-medium">BRAND</p>
            <input value={brandSlug} onChange={(e) => setBrandSlug(e.target.value)} placeholder="gucci または グッチ" className="w-full border border-border rounded-xl px-4 py-3 bg-white" />
            <p className="mt-2 text-xs text-muted">マスタにキーワードが登録されていれば自動変換されます</p>
          </div>

          <div>
            <p className="text-sm mb-2 tracking-[0.14em] text-muted font-medium">YEAR</p>
            <input value={year} onChange={(e) => handleYearChange(e.target.value)} placeholder="1999" className={`w-full border rounded-xl px-4 py-3 transition-colors ${yearError ? "border-red-500 bg-red-50/30 focus:outline-red-500" : "border-border bg-white"}`} />
            {yearError && <p className="mt-2 text-xs text-red-500 font-medium">{yearError}</p>}
          </div>

          <div>
            <p className="text-sm mb-4 tracking-[0.14em] text-muted font-medium">SEASON</p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => handleSeasonSelect("ss")}
                className={`px-5 py-3 rounded-xl border text-sm transition ${
                  seasonType === "ss" ? "bg-black text-white border-black" : "bg-white border-border"
                }`}
              >
                SS
              </button>
              <button
                type="button"
                onClick={() => handleSeasonSelect("fw")}
                className={`px-5 py-3 rounded-xl border text-sm transition ${
                  seasonType === "fw" ? "bg-black text-white border-black" : "bg-white border-border"
                }`}
              >
                FW
              </button>
            </div>
          </div>

          <div>
            <p className="text-sm mb-2 tracking-[0.14em] text-muted font-medium">DESIGNER</p>
            <input value={designerSlug} onChange={(e) => setDesignerSlug(e.target.value)} placeholder="tom-ford または トムフォード" className="w-full border border-border rounded-xl px-4 py-3 bg-white" />
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
                        ? "bg-black text-white border-black"
                        : "bg-white border-border hover:border-foreground"
                    }`}
                  >
                    {tag.name}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button onClick={handleUpdate} disabled={saving} className="border border-border rounded-xl px-6 py-4 hover:bg-black hover:text-white transition bg-white font-medium text-[14px]">
              {saving ? "変更を保存中..." : "変更を保存する"}
            </button>
            <button onClick={handleDelete} disabled={deleting} className="border border-red-500 text-red-500 rounded-xl px-6 py-4 hover:bg-red-500 hover:text-white transition bg-white font-medium text-[14px]">
              {deleting ? "削除中..." : "投稿を削除する"}
            </button>
          </div>
        </div>
      </section>
    </main>
  )
}