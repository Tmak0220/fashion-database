"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { supabase } from "@/lib/supabase"
import { createPost } from "@/app/actions/createPost"
import { compressImage } from "@/lib/imageCompression"

type Tag = {
  id: string
  name: string
  slug: string
}

type Props = {
  onPostCreated?: () => Promise<void> | void
}

type StatusMessage = {
  text: string
  type: "error" | "success"
}

export default function CreatePostForm({ onPostCreated }: Props) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [brandSlug, setBrandSlug] = useState("")
  const [year, setYear] = useState("")
  const [yearError, setYearError] = useState("")
  const [seasonType, setSeasonType] = useState<"ss" | "fw" | "">("")
  const [designerSlug, setDesignerSlug] = useState("")
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [creating, setCreating] = useState(false)
  const [tags, setTags] = useState<Tag[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [fileName, setFileName] = useState("選択されていません")
  const [isPlusMember, setIsPlusMember] = useState(false)
  const [checkingPlan, setCheckingPlan] = useState(true)
  const [statusMessage, setStatusMessage] = useState<StatusMessage | null>(null)
  const [uploadMessage, setUploadMessage] = useState<StatusMessage | null>(null)

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
      const { data, error } = await supabase.from("tags").select("*").order("name")
      if (!error) setTags(data || [])
      setCheckingPlan(false)
    }
    fetchInitialData()
  }, [])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return;
    setUploading(true)
    setUploadMessage(null)
    try {
      const compressed = await compressImage(file);
      const formData = new FormData()
      formData.append("file", compressed)
      const res = await fetch("/api/upload", { method: "POST", body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setImageUrls((prev) => [...prev, data.url])
      setFileName(file.name)
    } catch (err: any) {
      setUploadMessage({ text: err.message || "アップロード失敗", type: "error" })
    } finally {
      setUploading(false)
    }
  }

  const handleCreatePost = async () => {
    setStatusMessage(null)

    if (!isPlusMember) {
      setStatusMessage({ text: "MEMBER限定機能です。", type: "error" })
      return
    }
    if (yearError) {
      setStatusMessage({ text: "YEARの入力内容を確認してください。", type: "error" })
      return
    }
    if (imageUrls.length === 0) {
      setStatusMessage({ text: "画像をアップロードしてください。", type: "error" })
      return
    }

    setCreating(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("ログインしてください")
      
      await createPost({ title, description, brandSlug, designerSlug, year, season: seasonType, imageUrls, selectedTags }, user.id)
      
      setStatusMessage({ text: "投稿が完了しました", type: "success" })

      setTimeout(() => {
        setStatusMessage(null)
      }, 3000)

      setTitle("")
      setDescription("")
      setBrandSlug("")
      setYear("")
      setYearError("")
      setSeasonType("")
      setDesignerSlug("")
      setImageUrls([])
      setSelectedTags([])
      setFileName("選択されていません")

      if (onPostCreated) {
        await onPostCreated()
      }

    } catch (e: any) {
      setStatusMessage({ text: "投稿に失敗しました: " + e.message, type: "error" })
    } finally {
      setCreating(false)
    }
  }

  const toggleTag = (id: string) => setSelectedTags(p => p.includes(id) ? p.filter(i => i !== id) : [...p, id]);
  const handleSeasonSelect = (s: "ss" | "fw") => setSeasonType(p => p === s ? "" : s);
  const handleYearChange = (v: string) => { setYear(v); setYearError(/^[0-9]*$/.test(v) ? "" : "半角数字で入力"); };
  const removeImage = (url: string) => setImageUrls(p => p.filter(i => i !== url));

  if (checkingPlan) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="flex items-center gap-4">
          <div className="h-[54px] bg-neutral-100 rounded-xl border border-neutral-200/60 w-[156px]" />
          <div className="h-4 bg-neutral-100 rounded w-28" />
        </div>
        <div className="space-y-2">
          <div className="h-5 bg-neutral-100 rounded w-12" />
          <div className="h-[50px] bg-neutral-100 rounded-xl border border-neutral-200/60 w-full" />
        </div>
        <div className="space-y-2">
          <div className="h-5 bg-neutral-100 rounded w-24" />
          <div className="h-[166px] bg-neutral-100 rounded-xl border border-neutral-200/60 w-full" />
        </div>
      </div>
    )
  }

  if (!isPlusMember) {
    return (
      <div className="border border-border rounded-2xl p-8 sm:p-10 bg-surface">
        <p className="type-label text-[11px] tracking-[0.12em] text-subtle">MEMBERS ONLY</p>
        <h3 className="mt-5 text-2xl sm:text-3xl text-foreground break-words leading-tight">
          MEMBER限定機能
        </h3>
        <p className="mt-6 text-sm leading-7 text-muted max-w-xl">
          MEMBERになると、アーカイブの解説の閲覧、画像の投稿、いいね、ブックマーク、フォローが利用できます。
        </p>
        <Link href="/members" className="inline-block mt-8 border border-border rounded-xl px-6 py-4 bg-white font-medium text-[14px] hover:bg-black hover:text-white transition-colors duration-300 active:scale-[0.98]">
          MEMBERになる
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm mb-1 tracking-[0.14em] text-muted font-medium">IMAGE</p>
        <p className="text-xs text-muted mb-3">アーカイブのアイテム画像を選択してください (複数選択可)</p>
        <label className="inline-flex items-center gap-4 cursor-pointer">
          <span className="type-label text-sm px-6 py-4 border border-border rounded-xl bg-surface text-foreground hover:bg-foreground hover:text-background transition-colors duration-300 active:scale-[0.98]">
            ファイルを選択
          </span>
          <span className="text-sm text-muted font-medium truncate max-w-[200px]">
            {fileName}
          </span>
          <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
        </label>
        {uploading && <p className="mt-4 text-xs text-muted animate-pulse pl-1">アップロード中...</p>}
        
        {uploadMessage && (
          <div className="mt-4 text-xs p-4 rounded-xl border text-red-500 bg-red-50/50 border-red-200 max-w-md">
            {uploadMessage.text}
          </div>
        )}
      </div>

      {imageUrls.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:gap-6">
          {imageUrls.map((url) => (
            <div key={url} className="space-y-3">
              <div className="overflow-hidden rounded-2xl border border-border bg-surface relative w-full aspect-[4/5]">
                <Image
                  src={url}
                  alt="Preview"
                  fill
                  sizes="(max-width: 768px) 50vw, 33vw"
                  className="object-cover"
                />
              </div>
              <button type="button" onClick={() => removeImage(url)} className="text-xs underline text-red-500 hover:text-red-700 transition-colors pl-1">
                削除する
              </button>
            </div>
          ))}
        </div>
      )}

      <div>
        <p className="text-sm mb-1 tracking-[0.14em] text-muted font-medium">TITLE</p>
        <p className="text-xs text-muted mb-2">アイテム名やコレクション名を入力してください</p>
        <input 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
          className="w-full border border-border rounded-xl px-4 py-3 bg-white text-foreground focus:outline-neutral-400 placeholder:text-neutral-400/70"
          placeholder="グッチ 1999年春夏 ジャケット"
        />
      </div>

      <div>
        <p className="text-sm mb-1 tracking-[0.14em] text-muted font-medium">DESCRIPTION</p>
        <p className="text-xs text-muted mb-2">ディテールや特徴、ストーリーについて自由に記述してください</p>
        <textarea 
          rows={6} 
          value={description} 
          onChange={(e) => setDescription(e.target.value)} 
          className="w-full border border-border rounded-xl px-4 py-3 bg-white text-foreground focus:outline-neutral-400 placeholder:text-neutral-400/70 leading-relaxed" 
        />
      </div>

      <div>
        <p className="text-sm mb-1 tracking-[0.14em] text-muted font-medium">BRAND</p>
        <p className="text-xs text-muted mb-2">アイテムのブランド名を入力してください（英名・和名対応）</p>
        <input 
          value={brandSlug} 
          onChange={(e) => setBrandSlug(e.target.value)} 
          placeholder="gucci または グッチ" 
          className="w-full border border-border rounded-xl px-4 py-3 bg-white text-foreground focus:outline-neutral-400 placeholder:text-neutral-400/70" 
        />
      </div>

      <div>
        <p className="text-sm mb-1 tracking-[0.14em] text-muted font-medium">YEAR</p>
        <p className="text-xs text-muted mb-2">発表またはリリースされた年を西暦（半角数字4桁）で入力してください</p>
        <input 
          value={year} 
          onChange={(e) => handleYearChange(e.target.value)} 
          placeholder="1999" 
          className={`w-full border rounded-xl px-4 py-3 transition-colors placeholder:text-neutral-400/70 ${yearError ? "border-red-500 bg-red-50/30 focus:outline-red-500" : "border-border bg-white text-foreground focus:outline-neutral-400"}`} 
        />
        {yearError && <p className="mt-2 text-xs text-red-500 font-medium pl-1">{yearError}</p>}
      </div>

      <div>
        <p className="text-sm mb-1 tracking-[0.14em] text-muted font-medium">SEASON</p>
        <p className="text-xs text-muted mb-3">該当するコレクションのシーズンを選択してください</p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => handleSeasonSelect("ss")}
            className={`px-5 py-3 rounded-xl border text-sm transition duration-200 active:scale-[0.97] ${
              seasonType === "ss" ? "bg-black text-white border-black" : "bg-white border-border text-foreground hover:border-neutral-400"
            }`}
          >
            SS
          </button>
          <button
            type="button"
            onClick={() => handleSeasonSelect("fw")}
            className={`px-5 py-3 rounded-xl border text-sm transition duration-200 active:scale-[0.97] ${
              seasonType === "fw" ? "bg-black text-white border-black" : "bg-white border-border text-foreground hover:border-neutral-400"
            }`}
          >
            FW
          </button>
        </div>
      </div>

      <div>
        <p className="text-sm mb-1 tracking-[0.14em] text-muted font-medium">DESIGNER</p>
        <p className="text-xs text-muted mb-2">当時のクリエイティブディレクター、またはデザイナー名を入力してください</p>
        <input 
          value={designerSlug} 
          onChange={(e) => setDesignerSlug(e.target.value)} 
          placeholder="tom-ford または トムフォード" 
          className="w-full border border-border rounded-xl px-4 py-3 bg-white text-foreground focus:outline-neutral-400 placeholder:text-neutral-400/70" 
        />
      </div>

      <div>
        <p className="text-sm mb-1 tracking-[0.14em] text-muted font-medium">TAGS</p>
        <p className="text-xs text-muted mb-3">アイテムに該当するカテゴリータグを選択してください (複数選択可)</p>
        <div className="flex flex-wrap gap-3">
          {tags.map((tag) => {
            const active = selectedTags.includes(String(tag.id))
            return (
              <button
                key={tag.id}
                type="button"
                onClick={() => toggleTag(tag.id)}
                className={`px-5 py-2.5 rounded-full border text-[14px] font-medium tracking-[0.05em] transition-all duration-200 active:scale-[0.96] ${
                  active
                    ? "bg-black text-white border-black"
                    : "bg-white border-border text-foreground hover:border-neutral-400"
                }`}
              >
                {tag.name}
              </button>
            )
          })}
        </div>
      </div>

      <div className="pt-4 space-y-4">
        {statusMessage && (
          <div className={`text-xs p-4 rounded-xl border max-w-md ${
            statusMessage.type === "error" 
              ? "text-red-500 bg-red-50/50 border-red-200" 
              : "text-foreground bg-neutral-50 border-border"
          }`}>
            {statusMessage.text}
          </div>
        )}

        <button onClick={handleCreatePost} disabled={creating} className="w-full sm:w-auto border border-border rounded-xl px-6 py-4 hover:bg-black hover:text-white transition bg-white text-foreground font-medium text-[14px] active:scale-[0.98]">
          {creating ? "作成中..." : "作成する"}
        </button>
      </div>
    </div>
  )
}