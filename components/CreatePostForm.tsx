"use client"

import { useEffect, useState, useRef } from "react"
import Image from "next/image"
import { supabase } from "@/lib/supabase"
import { createPost } from "@/app/actions/createPost"
import { compressImage } from "@/lib/imageCompression"
import { useLocale } from "@/context/LocaleContext"

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

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback

export default function CreatePostForm({ onPostCreated }: Props) {
  const { t } = useLocale()
  const fileInputRef = useRef<HTMLInputElement>(null)
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
  const [statusMessage, setStatusMessage] = useState<StatusMessage | null>(null)
  const [uploadMessage, setUploadMessage] = useState<StatusMessage | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const imageUrlsRef = useRef<string[]>([])

  useEffect(() => {
    imageUrlsRef.current = imageUrls
  }, [imageUrls])

  useEffect(() => {
    const handleBeforeUnload = () => {
      const urls = imageUrlsRef.current
      if (urls.length > 0) {
        const blob = new Blob([JSON.stringify({ urls })], { type: "application/json" })
        navigator.sendBeacon("/api/delete-objects-beacon", blob)
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [])

  useEffect(() => {
    const fetchInitialData = async () => {
      const { data, error } = await supabase.from("tags").select("*").order("name")
      if (!error) setTags(data || [])
    }
    fetchInitialData()
  }, [])

  const uploadFiles = async (files: File[]) => {
    const imageFiles = files.filter((file) => file.type.startsWith("image/"))
    if (imageFiles.length === 0) {
      setUploadMessage({ text: "画像ファイルを選択してください。", type: "error" })
      return
    }

    setUploading(true)
    setUploadMessage(null)

    try {
      const uploadPromises = imageFiles.map(async (file) => {
        const compressed = await compressImage(file)
        const formData = new FormData()
        formData.append("file", compressed)

        const res = await fetch("/api/upload", { method: "POST", body: formData })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || "アップロード失敗")
        return data.url
      })

      const uploadedUrls = await Promise.all(uploadPromises)

      setImageUrls((prev) => {
        const next = [...prev, ...uploadedUrls]
        setFileName(`${next.length}枚のファイルを選択中`)
        return next
      })
    } catch (err: unknown) {
      setUploadMessage({ text: getErrorMessage(err, "アップロード失敗"), type: "error" })
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length) void uploadFiles(files)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    if (uploading) return
    const files = Array.from(e.dataTransfer.files)
    if (files.length) void uploadFiles(files)
  }

  const handleCreatePost = async () => {
    setStatusMessage(null)

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

      imageUrlsRef.current = []

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

    } catch (e: unknown) {
      setStatusMessage({ text: "投稿に失敗しました: " + getErrorMessage(e, "不明なエラー"), type: "error" })
    } finally {
      setCreating(false)
    }
  }

  const toggleTag = (id: string) => setSelectedTags(p => p.includes(id) ? p.filter(i => i !== id) : [...p, id]);
  const handleSeasonSelect = (s: "ss" | "fw") => setSeasonType(p => p === s ? "" : s);
  const handleYearChange = (v: string) => { setYear(v); setYearError(/^[0-9]*$/.test(v) ? "" : "半角数字で入力"); };

  const removeImage = async (url: string) => {
    setUploadMessage(null)
    try {
      const res = await fetch("/api/delete-object", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      })

      if (!res.ok) {
        throw new Error("R2からの画像削除に失敗しました。")
      }

      setImageUrls(p => {
        const next = p.filter(i => i !== url)
        if (next.length === 0) {
          setFileName("選択されていません")
        } else {
          setFileName(`${next.length}枚のファイルを選択中`)
        }
        return next
      })
    } catch (err: unknown) {
      console.error(err)
      setUploadMessage({ text: "画像の削除に失敗しました。", type: "error" })
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm mb-1 tracking-[0.14em] text-muted font-medium">IMAGE</p>
        <p className="text-xs text-muted mb-3">{t("画像をドラッグ＆ドロップするか、ファイルを選択してください（複数選択可）")}</p>
        <div
          onDragEnter={(e) => { e.preventDefault(); if (!uploading) setIsDragging(true) }}
          onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "copy" }}
          onDragLeave={(e) => {
            e.preventDefault()
            if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setIsDragging(false)
          }}
          onDrop={handleDrop}
          className={`rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-colors ${
            isDragging ? "border-foreground bg-white" : "border-border bg-white hover:border-neutral-400"
          } ${uploading ? "cursor-wait opacity-70" : "cursor-pointer"}`}
          onClick={() => { if (!uploading) fileInputRef.current?.click() }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if ((e.key === "Enter" || e.key === " ") && !uploading) fileInputRef.current?.click()
          }}
        >
          <p className="text-sm font-medium text-foreground">
            {t(isDragging ? "ここにドロップしてください" : "画像をここにドラッグ＆ドロップ")}
          </p>
          <p className="mt-2 text-xs text-muted">{t("またはクリックしてファイルを選択")}</p>
          <p className="mt-4 text-xs text-subtle">{t(fileName)}</p>
          <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
        </div>
        {uploading && <p className="mt-4 text-xs text-muted animate-pulse pl-1">{t("アップロード中...")}</p>}
        
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
        <p className="text-xs text-muted mb-2">{t("アイテム名やコレクション名を入力してください")}</p>
        <input 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
          className="w-full border border-border rounded-xl px-4 py-3 bg-white text-foreground focus:outline-neutral-400 placeholder:text-neutral-400/70"
          placeholder="グッチ 1999年春夏 ジャケット"
        />
      </div>

      <div>
        <p className="text-sm mb-1 tracking-[0.14em] text-muted font-medium">DESCRIPTION</p>
        <p className="text-xs text-muted mb-2">{t("ディテールや特徴、ストーリーについて自由に記述してください")}</p>
        <textarea 
          rows={6} 
          value={description} 
          onChange={(e) => setDescription(e.target.value)} 
          className="w-full border border-border rounded-xl px-4 py-3 bg-white text-foreground focus:outline-neutral-400 placeholder:text-neutral-400/70 leading-relaxed" 
        />
      </div>

      <div>
        <p className="text-sm mb-1 tracking-[0.14em] text-muted font-medium">BRAND</p>
        <p className="text-xs text-muted mb-2">{t("アイテムのブランド名を入力してください（英名・和名対応）")}</p>
        <input 
          value={brandSlug} 
          onChange={(e) => setBrandSlug(e.target.value)} 
          placeholder="gucci または グッチ" 
          className="w-full border border-border rounded-xl px-4 py-3 bg-white text-foreground focus:outline-neutral-400 placeholder:text-neutral-400/70" 
        />
      </div>

      <div>
        <p className="text-sm mb-1 tracking-[0.14em] text-muted font-medium">YEAR</p>
        <p className="text-xs text-muted mb-2">{t("発表またはリリースされた年を西暦（半角数字4桁）で入力してください")}</p>
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
        <p className="text-xs text-muted mb-3">{t("該当するコレクションのシーズンを選択してください")}</p>
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
        <p className="text-xs text-muted mb-2">{t("当時のクリエイティブディレクター、またはデザイナー名を入力してください")}</p>
        <input 
          value={designerSlug} 
          onChange={(e) => setDesignerSlug(e.target.value)} 
          placeholder="tom ford または トムフォード" 
          className="w-full border border-border rounded-xl px-4 py-3 bg-white text-foreground focus:outline-neutral-400 placeholder:text-neutral-400/70" 
        />
      </div>

      <div>
        <p className="text-sm mb-1 tracking-[0.14em] text-muted font-medium">TAGS</p>
        <p className="text-xs text-muted mb-3">{t("アイテムに該当するカテゴリータグを選択してください (複数選択可)")}</p>
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
          {t(creating ? "作成中..." : "作成する")}
        </button>
      </div>
    </div>
  )
}
