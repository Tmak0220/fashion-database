"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
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
    if (!file) return
    setUploading(true)
    try {
      const compressed = await compressImage(file)
      const formData = new FormData()
      formData.append("file", compressed)
      const res = await fetch("/api/upload", { method: "POST", body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setImageUrls((prev) => [...prev, data.url])
      setFileName(file.name)
    } catch (err: any) {
      alert(err.message || "アップロード失敗")
    } finally {
      setUploading(false)
    }
  }

  const handleYearChange = (v: string) => {
    setYear(v)
    setYearError(/^[0-9]*$/.test(v) ? "" : "半角数字で入力")
  }

  const toggleTag = (id: string) => setSelectedTags(p => p.includes(id) ? p.filter(i => i !== id) : [...p, id])
  const handleSeasonSelect = (s: "ss" | "fw") => setSeasonType(p => p === s ? "" : s)
  const removeImage = (url: string) => setImageUrls(p => p.filter(i => i !== url))

  const handleCreatePost = async () => {
    if (!isPlusMember) return alert("PLUS MEMBER限定機能です")
    if (yearError || !title.trim()) return alert("タイトルとYEARを確認してください")
    if (imageUrls.length === 0) return alert("画像をアップロードしてください")
    
    setCreating(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("ログインしてください")
      
      await createPost({ 
        title, 
        description, 
        brandSlug, 
        designerSlug, 
        year, 
        season: seasonType, 
        imageUrls, 
        selectedTags 
      }, user.id)
      
      alert("投稿が作成されました")
      onPostCreated?.()
    } catch (e: any) {
      alert("投稿に失敗しました: " + e.message)
    } finally {
      setCreating(false)
    }
  }

  if (checkingPlan) return <div className="text-[14px] text-muted font-medium">読み込み中...</div>

  if (!isPlusMember) {
    return (
      <div className="border border-border rounded-2xl p-8 bg-surface">
        <p className="type-label text-[11px] tracking-[0.12em] text-subtle">PLUS MEMBERS ONLY</p>
        <h3 className="mt-5 text-2xl text-foreground">投稿機能はPLUS限定です</h3>
        <Link href="/members" className="inline-block mt-8 border rounded-xl px-6 py-4 bg-white text-[14px] hover:bg-black hover:text-white transition">
          PLUS MEMBERになる
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <button onClick={handleCreatePost} disabled={creating} className="...">
        {creating ? "作成中..." : "作成する"}
      </button>
    </div>
  )
}