"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"

type Props = {
  userId: string
  initialAvatarUrl: string | null
}

export default function AvatarUpload({ userId, initialAvatarUrl }: Props) {
  const [uploading, setUploading] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl || "")
  const [fileName, setFileName] = useState("選択されていません")

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) {
      setFileName("選択されていません")
      return
    }

    setFileName(file.name)
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

      const imageUrl = data.url
      const { error } = await supabase
        .from("users")
        .update({ avatar_url: imageUrl })
        .eq("id", userId)

      if (error) {
        alert("プロフィールの更新に失敗しました。")
        return
      }

      setAvatarUrl(imageUrl)
    } catch (err) {
      console.error(err)
      alert("予期せぬエラーが発生しました。")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-8 flex flex-col items-start">
      <div className="w-48 h-48 rounded-full overflow-hidden border border-border bg-surface flex items-center justify-center">
        {avatarUrl ? (
          <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
        ) : (
          <div className="type-brand text-5xl text-subtle select-none tracking-wide flex items-center justify-center" style={{ lineHeight: 1 }}>
            FD
          </div>
        )}
      </div>

      <div>
        <label className="inline-flex items-center gap-4 cursor-pointer">
          <span className="type-label text-sm px-6 py-4 border border-border rounded-xl bg-surface text-foreground hover:bg-foreground hover:text-background transition-colors duration-300">
            ファイルを選択
          </span>
          <span className="text-sm text-muted font-medium truncate max-w-[220px]">
            {fileName}
          </span>
          <input type="file" accept="image/*" onChange={handleUpload} disabled={uploading} className="hidden" />
        </label>
      </div>

      {uploading && (
        <p className="text-xs text-muted font-medium animate-pulse">
          アップロード中...
        </p>
      )}
    </div>
  )
}