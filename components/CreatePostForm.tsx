"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

type Tag = {
  id: string
  name: string
  slug: string
}

export default function CreatePostForm() {
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
  const [uploading, setUploading] = useState(false)
  const [creating, setCreating] = useState(false)
  const [tags, setTags] = useState<Tag[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [fileName, setFileName] = useState("選択されていません")
  const [isPlusMember, setIsPlusMember] = useState(false)
  const [checkingPlan, setCheckingPlan] = useState(true)

  useEffect(() => {
    const fetchInitialData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from("users")
          .select("plus_member")
          .eq("id", user.id)
          .single()
        setIsPlusMember(!!profile?.plus_member)
      }

      const { data, error } = await supabase
        .from("tags")
        .select("*")
        .order("name")
      if (!error) {
        setTags(data || [])
      }
      setCheckingPlan(false)
    }
    fetchInitialData()
  }, [])

  useEffect(() => {
    if (yearError || !year || !seasonType) {
      setSeasonSlug("")
      setCollectionSlug("")
      return
    }

    const generatedSeasonSlug = `${year}-${seasonType}`
    setSeasonSlug(generatedSeasonSlug)

    if (brandSlug.trim()) {
      setCollectionSlug(`${brandSlug.trim()}-${generatedSeasonSlug}`)
    } else {
      setCollectionSlug(generatedSeasonSlug)
    }
  }, [brandSlug, year, seasonType, yearError])

  const toggleTag = (tagId: string) => {
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
    const file = e.target.files?.[0]
    if (!file) {
      setFileName("選択されていません")
      return
    }

    setFileName(file.name)
    if (imageUrls.length >= 2) {
      alert("画像は最大2枚までアップロード可能です。")
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })
      const data = await res.json()

      if (!res.ok) {
        alert("画像のアップロードに失敗しました。時間をおいて再度お試しください。")
        return
      }
      setImageUrls((prev) => [...prev, data.url])
    } catch (err) {
      console.error(err)
      alert("予期せぬエラーが発生しました。")
    } finally {
      setUploading(false)
    }
  }

  const removeImage = (url: string) => {
    setImageUrls((prev) => prev.filter((item) => item !== url))
  }

  const handleCreatePost = async () => {
    if (!isPlusMember) {
      alert("PLUS MEMBER限定機能です")
      return
    }

    if (yearError) {
      alert("YEARの入力内容を確認してください。")
      return
    }

    if (imageUrls.length === 0) {
      alert("最初に画像をアップロードしてください。")
      return
    }

    setCreating(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        alert("ログインが必要です")
        return
      }

      let finalBrandSlug = brandSlug.trim().toLowerCase() || null
      let finalDesignerSlug = designerSlug.trim() || null

      if (brandSlug.trim()) {
        const inputBrand = brandSlug.trim()
        const { data: matchedBrand } = await supabase
          .from("brands")
          .select("slug")
          .or(`slug.eq.${inputBrand},name.eq.${inputBrand},search_keywords.ilike.%${inputBrand}%`)
          .range(0, 0)
          .maybeSingle()

        if (matchedBrand?.slug) {
          finalBrandSlug = matchedBrand.slug
        }
      }

      if (designerSlug.trim()) {
        const inputDesigner = designerSlug.trim()
        const { data: matchedDesigner } = await supabase
          .from("designers")
          .select("slug")
          .or(`slug.eq.${inputDesigner},name.eq.${inputDesigner},search_keywords.ilike.%${inputDesigner}%`)
          .range(0, 0)
          .maybeSingle()

        if (matchedDesigner?.slug) {
          finalDesignerSlug = matchedDesigner.slug
        }
      }

      let finalCollectionSlug = seasonSlug || null
      if (finalBrandSlug && seasonSlug) {
        finalCollectionSlug = `${finalBrandSlug}-${seasonSlug}`
      }
      const finalSeasonSlug = seasonSlug || null

      const { data: post, error } = await supabase
        .from("posts")
        .insert({
          user_id: user.id,
          image_urls: imageUrls,
          title,
          description,
          brand_slug: finalBrandSlug,
          collection_slug: finalCollectionSlug,
          season_slug: finalSeasonSlug,
          designer_slug: finalDesignerSlug,
        })
        .select()
        .single()

      if (error || !post) {
        alert("ポストの作成に失敗しました。")
        return
      }

      if (selectedTags.length > 0) {
        const postTags = selectedTags.map((tagId) => ({
          post_id: post.id,
          tag_id: tagId,
        }))
        await supabase.from("post_tags").insert(postTags)
      }

      alert("ポストが作成されました")

      setTitle("")
      setDescription("")
      setBrandSlug("")
      setYear("")
      setYearError("")
      setSeasonType("")
      setCollectionSlug("")
      setSeasonSlug("")
      setDesignerSlug("")
      setSelectedTags([])
      setImageUrls([])
      setFileName("選択されていません")
    } catch (err) {
      console.error(err)
      alert("予期せぬエラーが発生しました。")
    }  finally {
      setCreating(false)
    }
  }

  if (checkingPlan) {
    return (
      <div className="text-[14px] text-muted font-medium">
        読み込み中...
      </div>
    )
  }

  if (!isPlusMember) {
    return (
      <div className="border border-border rounded-2xl p-8 sm:p-10 bg-surface">
        <p className="type-label text-[11px] tracking-[0.12em] text-subtle">PLUS MEMBERS ONLY</p>
        <h3 className="mt-5 text-2xl sm:text-3xl text-foreground break-words leading-tight">
          投稿機能はPLUS限定です
        </h3>
        <p className="mt-6 text-sm leading-7 text-muted max-w-xl">
          PLUS MEMBERになると、画像投稿、ブックマーク、フォロー、高画質閲覧、限定アーカイブ機能が利用できます。
        </p>
        <Link href="/members" className="inline-block mt-8 border border-border rounded-xl px-6 py-4 bg-white font-medium text-[14px] hover:bg-black hover:text-white transition-colors duration-300">
          PLUS MEMBERになる
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <label className="inline-flex items-center gap-4 cursor-pointer">
          <span className="type-label text-sm px-6 py-4 border border-border rounded-xl bg-surface text-foreground hover:bg-foreground hover:text-background transition-colors duration-300">
            ファイルを選択
          </span>
          <span className="text-sm text-muted font-medium truncate max-w-[200px]">
            {fileName}
          </span>
          <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
        </label>
        {uploading && <p className="mt-4 text-sm text-muted">アップロード中...</p>}
      </div>

      {imageUrls.length > 0 && (
        <div className="grid grid-cols-2 gap-6">
          {imageUrls.map((url) => (
            <div key={url} className="space-y-3">
              <div className="overflow-hidden rounded-2xl border border-border bg-surface">
                <img src={url} alt="" className="w-full aspect-[4/5] object-cover" />
              </div>
              <button type="button" onClick={() => removeImage(url)} className="text-xs underline text-red-500 hover:text-red-700 transition-colors pl-1">
                削除する
              </button>
            </div>
          ))}
        </div>
      )}

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
            const active = selectedTags.includes(tag.id)
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

      <div className="pt-4">
        <button onClick={handleCreatePost} disabled={creating} className="border border-border rounded-xl px-6 py-4 hover:bg-black hover:text-white transition bg-white font-medium text-[14px]">
          {creating ? "作成中..." : "作成する"}
        </button>
      </div>
    </div>
  )
}