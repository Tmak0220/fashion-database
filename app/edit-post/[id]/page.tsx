"use client"

import { useEffect, useState, useLayoutEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import PostThumbnail from "@/components/PostThumbnail"
import Link from "@/components/LocalizedLink"
import { supabase } from "@/lib/supabase"
import EditLoading from "./loading"
import { compressImage } from "@/lib/imageCompression"
import { updatePost } from "@/app/actions/createPost"
import { useLocale } from "@/context/LocaleContext"

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
  const { localizePath } = useLocale()
  const params = useParams()
  const router = useRouter()
  const postId = params.id as string
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isAuthChecked, setIsAuthChecked] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [hasTagLoadError, setHasTagLoadError] = useState(false)

  const [statusMessage, setStatusMessage] = useState<StatusMessage | null>(null)

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [brandSlug, setBrandSlug] = useState("")
  const [year, setYear] = useState("")
  const [yearError, setYearError] = useState("")
  const [season, setSeason] = useState<"ss" | "fw" | "">("")
  const [designerSlug, setDesignerSlug] = useState("")
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [fileName, setFileName] = useState("選択されていません")

  const initialImageUrlsRef = useRef<string[]>([])
  const currentImageUrlsRef = useRef<string[]>([])
  const accessTokenRef = useRef<string | null>(null)
  const uploadInProgressRef = useRef(false)
  const pendingUploadedUrlsRef = useRef<string[]>([])
  const componentMountedRef = useRef(true)

  useEffect(() => {
    currentImageUrlsRef.current = imageUrls
  }, [imageUrls])

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      accessTokenRef.current = data.session?.access_token ?? null
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      accessTokenRef.current = session?.access_token ?? null
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    componentMountedRef.current = true

    const cleanupAbandonedImages = () => {
      const originalUrls = initialImageUrlsRef.current
      const currentUrls = currentImageUrlsRef.current
      const abandonedUrls = Array.from(new Set([
        ...currentUrls.filter(url => !originalUrls.includes(url)),
        ...pendingUploadedUrlsRef.current,
      ]))
      const accessToken = accessTokenRef.current

      if (abandonedUrls.length > 0 && accessToken) {
        void fetch("/api/delete-object-beacon", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ urls: abandonedUrls }),
          keepalive: true,
        })
      }
    }

    const handleBeforeUnload = () => cleanupAbandonedImages()

    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => {
      componentMountedRef.current = false
      window.removeEventListener("beforeunload", handleBeforeUnload)
      cleanupAbandonedImages()
    }
  }, [])

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

      const { data: postData, error: postError } = await supabase
        .from("posts")
        .select(`
          *,
          users:profiles!posts_user_id_fkey (id, username, avatar_url),
          brands!posts_brand_id_fkey (slug),
          designers!posts_designer_id_fkey (slug)
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

      const [tagsResult, postTagsResult] = await Promise.all([
        supabase.from("tags").select("*").order("name"),
        supabase.from("post_tags").select("tag_id").eq("post_id", postId),
      ])

      const normalizedPost = {
        ...postData,
        brands: Array.isArray(postData.brands) ? postData.brands[0] || null : postData.brands,
        designers: Array.isArray(postData.designers) ? postData.designers[0] || null : postData.designers,
      }
      setTitle(postData.title || "")
      setDescription(postData.description || "")
      setBrandSlug(normalizedPost.brands?.slug || "")
      setDesignerSlug(normalizedPost.designers?.slug || "")
      
      const urls = postData.image_urls || []
      setImageUrls(urls)
      setFileName(urls.length > 0 ? `${urls.length}枚のファイルを選択中` : "選択されていません")
      initialImageUrlsRef.current = urls
      
      setTags(tagsResult.data || [])

      setYear(postData.year ? String(postData.year) : "")
      setSeason((postData.season as "ss" | "fw") || "")

      const currentTags = postTagsResult.data?.map((item) => String(item.tag_id)) || []
      setSelectedTags(currentTags)

      if (tagsResult.error || postTagsResult.error) {
        console.error("Tag data fetch error:", tagsResult.error || postTagsResult.error)
        setHasTagLoadError(true)
        setStatusMessage({
          text: "タグ情報を取得できませんでした。再読み込みしてから編集してください。",
          type: "error",
        })
      }
      
      setIsAuthChecked(true)
    }

    fetchPostAndVerify()
  }, [postId])

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

  const uploadFiles = async (files: File[]) => {
    if (uploadInProgressRef.current || saving || deleting) return

    setStatusMessage(null)

    const imageFiles = files.filter((file) => file.type.startsWith("image/"))
    if (imageFiles.length === 0) {
      setStatusMessage({ text: "画像ファイルを選択してください。", type: "error" })
      return
    }

    if (imageUrls.length + imageFiles.length > 2) {
      setStatusMessage({ text: "画像は最大2枚までアップロード可能です。", type: "error" })
      return
    }

    uploadInProgressRef.current = true
    setUploading(true)
    const uploadedUrls: string[] = []

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) throw new Error("ログインしてください。")

      for (const file of imageFiles) {
        setFileName(file.name)
        
        const compressed = await compressImage(file)
        
        const formData = new FormData()
        formData.append("file", compressed)

        const res = await fetch("/api/upload", {
          method: "POST",
          headers: { Authorization: `Bearer ${session.access_token}` },
          body: formData,
        })

        const contentType = res.headers.get("content-type") || ""
        if (!contentType.includes("application/json")) {
          throw new Error("アップロードサーバーでエラーが発生しました。時間をおいて再度お試しください。")
        }

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}))
          throw new Error(errorData.error || "画像のアップロードに失敗しました。")
        }

        const data = await res.json()
        uploadedUrls.push(data.url)
        pendingUploadedUrlsRef.current.push(data.url)

        if (!componentMountedRef.current) {
          const accessToken = accessTokenRef.current
          if (accessToken) {
            void fetch("/api/delete-object-beacon", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
              },
              body: JSON.stringify({ urls: [data.url] }),
              keepalive: true,
            })
          }
          return
        }
      }

      setImageUrls((prev) => [...prev, ...uploadedUrls])
      pendingUploadedUrlsRef.current = pendingUploadedUrlsRef.current.filter(
        (url) => !uploadedUrls.includes(url)
      )
      setFileName(`${imageUrls.length + uploadedUrls.length}枚のファイルを選択中`)

    } catch (err: unknown) {
      if (uploadedUrls.length > 0) {
        const accessToken = accessTokenRef.current
        if (accessToken) {
          await fetch("/api/delete-object-beacon", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ urls: uploadedUrls }),
          }).catch((cleanupError) => console.error("Upload cleanup error:", cleanupError))
        }
      }
      pendingUploadedUrlsRef.current = pendingUploadedUrlsRef.current.filter(
        (url) => !uploadedUrls.includes(url)
      )
      console.error("Upload Error:", err)
      setStatusMessage({ 
        text: err instanceof Error ? err.message : "画像のアップロード中にエラーが発生しました。",
        type: "error" 
      })
    } finally {
      uploadInProgressRef.current = false
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
    if (uploadInProgressRef.current || saving || deleting) return

    const files = Array.from(e.dataTransfer.files)
    if (files.length) void uploadFiles(files)
  }

  const removeImage = async (targetUrl: string) => {
    if (uploadInProgressRef.current || saving || deleting) return
    setStatusMessage(null)
    try {
      const isTemporaryImage = new URL(targetUrl).pathname.includes("/tmp/")
      if (isTemporaryImage) {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session?.access_token) throw new Error("ログインしてください。")

        const res = await fetch("/api/delete-object", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ url: targetUrl }),
        })

        if (!res.ok) throw new Error("R2からの画像削除に失敗しました。")
      }

      setImageUrls((prev) => prev.filter((url) => url !== targetUrl))
      setFileName("選択されていません")
      
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } catch (err: unknown) {
      console.error(err)
      setStatusMessage({ text: "画像の削除に失敗しました。", type: "error" })
    }
  }

  const handleUpdate = async () => {
    setStatusMessage(null)

    if (uploadInProgressRef.current || deleting) return
    if (hasTagLoadError) {
      setStatusMessage({ text: "タグ情報を取得できていないため保存できません。ページを再読み込みしてください。", type: "error" })
      return
    }
    if (yearError) {
      setStatusMessage({ text: "YEARの入力内容を確認してください。", type: "error" })
      return
    }
    if (imageUrls.length === 0) {
      setStatusMessage({ text: "少なくとも1枚の画像が必要です。", type: "error" })
      return
    }

    setSaving(true)
    try {
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

      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) throw new Error("ログインしてください")

      const result = await updatePost(
        postId,
        {
          title,
          description,
          brandSlug: finalBrandSlug,
          designerSlug: finalDesignerSlug,
          season: season,
          year: year,
          imageUrls: imageUrls,
          selectedTags: selectedTags,
        },
        session.access_token
      )

      initialImageUrlsRef.current = result.imageUrls
      currentImageUrlsRef.current = result.imageUrls
      setImageUrls(result.imageUrls)

      setStatusMessage({ text: "投稿を更新しました", type: "success" })
      router.replace(localizePath("/mypage"))

    } catch (postError: unknown) {
      console.error(postError)
      setStatusMessage({ text: "更新に失敗しました: " + (postError instanceof Error ? postError.message : "不明なエラー"), type: "error" })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (uploadInProgressRef.current || saving || deleting) return
    setStatusMessage(null)
    if (!window.confirm("この投稿を削除しますか？\n（画像も同時に完全に削除されます）")) return
    
    setDeleting(true)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) throw new Error("ログインしてください。")

      const res = await fetch("/api/delete-post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ postId }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "削除に失敗しました。")
      }

      const temporaryUrls = currentImageUrlsRef.current.filter(
        (url) => !initialImageUrlsRef.current.includes(url)
      )
      if (temporaryUrls.length > 0) {
        await fetch("/api/delete-object-beacon", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ urls: temporaryUrls }),
        }).catch((cleanupError) => console.error("Temporary image cleanup error:", cleanupError))
      }

      initialImageUrlsRef.current = []
      currentImageUrlsRef.current = []

      setStatusMessage({ text: "投稿と画像を削除しました", type: "success" })
      router.replace(localizePath("/mypage"))
    } catch (err: unknown) {
      console.error(err)
      setStatusMessage({ text: err instanceof Error ? err.message : "削除に失敗しました。", type: "error" })
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
            編集権限がありません
          </h1>
          <p className="mt-4 text-xs text-muted leading-relaxed">
            投稿を所有しているアカウントでログインしてください。
          </p>
          <Link
            href="/login"
            className="mt-8 block w-full text-center bg-black text-white font-medium rounded-xl px-4 py-3 text-[12px] transition-colors duration-300 hover:bg-neutral-800"
          >
            ログインする
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

        <div>
          <p className="text-sm mt-12 mb-1 tracking-[0.14em] text-muted font-medium">IMAGE</p>
          <p className="text-xs text-muted mb-4">画像をドラッグ＆ドロップするか、ファイルを選択してください（最大2枚）</p>

          <div
            onDragEnter={(e) => { e.preventDefault(); if (!uploading && !saving && !deleting) setIsDragging(true) }}
            onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "copy" }}
            onDragLeave={(e) => {
              e.preventDefault()
              if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setIsDragging(false)
            }}
            onDrop={handleDrop}
            onClick={() => { if (!uploading && !saving && !deleting) fileInputRef.current?.click() }}
            onKeyDown={(e) => {
              if ((e.key === "Enter" || e.key === " ") && !uploading && !saving && !deleting) fileInputRef.current?.click()
            }}
            className={`mb-6 rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-colors ${
              isDragging ? "border-foreground bg-white" : "border-border bg-white hover:border-neutral-400"
            } ${uploading || saving || deleting ? "cursor-wait opacity-70" : "cursor-pointer"}`}
            role="button"
            tabIndex={0}
          >
            <p className="text-sm font-medium text-foreground">
              {isDragging ? "ここにドロップしてください" : "画像をここにドラッグ＆ドロップ"}
            </p>
            <p className="mt-2 text-xs text-muted">またはクリックしてファイルを選択</p>
            <p className="mt-4 text-xs text-subtle">{fileName}</p>
            <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
          </div>
          {uploading && <p className="mb-6 text-xs text-muted animate-pulse pl-1">アップロード中...</p>}
          
          <div className="grid grid-cols-2 gap-4 sm:gap-6 max-w-4xl mb-6">
            {imageUrls.map((url, index) => (
              <div key={url} className="space-y-3">
                <PostThumbnail
                  src={url}
                  alt={`Preview ${index + 1}`}
                  sizes="(max-width: 640px) 50vw, 33vw"
                />
                <button type="button" onClick={() => removeImage(url)} disabled={uploading || saving || deleting} className="text-xs underline text-red-500 hover:text-red-700 transition-colors pl-1 disabled:cursor-not-allowed disabled:opacity-50">
                  削除する
                </button>
              </div>
            ))}
          </div>

        </div>

        <div className="mt-10 space-y-8 max-w-3xl">
          <div>
            <p className="text-sm mb-1 tracking-[0.14em] text-muted font-medium">TITLE</p>
            <p className="text-xs text-muted mb-2">アイテム名やコレクション名を入力してください</p>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border border-border rounded-xl px-4 py-3 bg-white text-foreground focus:outline-neutral-400 placeholder:text-neutral-400/70" placeholder="Multi-Pocket Cargo Pants" />
          </div>

          <div>
            <p className="text-sm mb-1 tracking-[0.14em] text-muted font-medium">DESCRIPTION</p>
            <p className="text-xs text-muted mb-2">ディテールや特徴、ストーリーについて自由に記述してください</p>
            <textarea rows={6} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border border-border rounded-xl px-4 py-3 bg-white text-foreground focus:outline-neutral-400 placeholder:text-neutral-400/70 leading-relaxed" />
          </div>

          <div>
            <p className="text-sm mb-1 tracking-[0.14em] text-muted font-medium">BRAND</p>
            <p className="text-xs text-muted mb-2">アイテムのブランド名を入力してください（英名・和名対応）</p>
            <input value={brandSlug} onChange={(e) => setBrandSlug(e.target.value)} placeholder="gucci または グッチ" className="w-full border border-border rounded-xl px-4 py-3 bg-white text-foreground focus:outline-neutral-400 placeholder:text-neutral-400/70" />
          </div>

          <div>
            <p className="text-sm mb-1 tracking-[0.14em] text-muted font-medium">YEAR</p>
            <p className="text-xs text-muted mb-2">発表またはリリースされた年を西暦（半角数字4桁）で入力してください</p>
            <input value={year} onChange={(e) => handleYearChange(e.target.value)} placeholder="1999" className={`w-full border rounded-xl px-4 py-3 transition-colors placeholder:text-neutral-400/70 ${yearError ? "border-red-500 bg-red-50/30 focus:outline-red-500" : "border-border bg-white text-foreground focus:outline-neutral-400"}`} />
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
                  season === "ss" ? "bg-black text-white border-black" : "bg-white border-border text-foreground hover:border-neutral-400"
                }`}
              >
                SS
              </button>
              <button
                type="button"
                onClick={() => handleSeasonSelect("fw")}
                className={`px-5 py-3 rounded-xl border text-sm transition duration-200 active:scale-[0.97] ${
                  season === "fw" ? "bg-black text-white border-black" : "bg-white border-border text-foreground hover:border-neutral-400"
                }`}
              >
                FW
              </button>
            </div>
          </div>

          <div>
            <p className="text-sm mb-1 tracking-[0.14em] text-muted font-medium">DESIGNER</p>
            <p className="text-xs text-muted mb-2">当時のクリエイティブディレクター、またはデザイナー名を入力してください</p>
            <input value={designerSlug} onChange={(e) => setDesignerSlug(e.target.value)} placeholder="tom-ford または トムフォード" className="w-full border border-border rounded-xl px-4 py-3 bg-white text-foreground focus:outline-neutral-400 placeholder:text-neutral-400/70" />
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

          {statusMessage && (
            <div className={`text-xs p-4 rounded-xl border ${
              statusMessage.type === "error" 
                ? "text-red-500 bg-red-50/50 border-red-200" 
                : "text-foreground bg-neutral-50 border-border"
            }`}>
              {statusMessage.text}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <button onClick={handleUpdate} disabled={saving || uploading || deleting || hasTagLoadError} className="w-full sm:w-auto border border-border rounded-xl px-6 py-4 hover:bg-black hover:text-white transition bg-white text-foreground font-medium text-[14px] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60">
              {saving ? "変更を保存中..." : "変更を保存する"}
            </button>
            <button onClick={handleDelete} disabled={deleting || saving || uploading} className="w-full sm:w-auto border border-red-500 text-red-500 rounded-xl px-6 py-4 hover:bg-red-500 hover:text-white transition bg-white font-medium text-[14px] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60">
              {deleting ? "削除中..." : "投稿を削除する"}
            </button>
          </div>
        </div>
      </section>
    </main>
  )
}
