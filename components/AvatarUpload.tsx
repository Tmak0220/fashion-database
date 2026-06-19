"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { compressImage } from "@/lib/imageCompression"

type Props = {
  userId: string
  initialAvatarUrl: string | null
  username: string | null
}

type StatusMessage = {
  text: string
  type: "error" | "success"
}

export default function AvatarUpload({ userId, initialAvatarUrl, username }: Props) {
  const router = useRouter()
  const [uploading, setUploading] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl || "")
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState(initialAvatarUrl)
  const [fileName, setFileName] = useState("選択されていません")
  const [statusMessage, setStatusMessage] = useState<StatusMessage | null>(null)

  const showMessage = (text: string, type: "error" | "success") => {
    setStatusMessage({ text, type })
    setTimeout(() => {
      setStatusMessage(null)
    }, 3000)
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]

    if (!file) {
      setFileName("選択されていません")
      return
    }

    setFileName(file.name)
    setUploading(true)
    setStatusMessage(null)

    let fileToUpload: File

    try {
      fileToUpload = await compressImage(file)
    } catch (err) {
      showMessage(
        err instanceof Error ? err.message : "画像の圧縮に失敗しました。",
        "error"
      )
      setUploading(false)
      e.target.value = ""
      return
    }

    try {
      const formData = new FormData()
      formData.append("file", fileToUpload)

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        showMessage(
          data.error || "画像のアップロードに失敗しました。時間をおいて再度お試しください。",
          "error"
        )
        setUploading(false)
        e.target.value = ""
        return
      }

      const imageUrl = data.url

      const { error } = await supabase
        .from("users")
        .update({ avatar_url: imageUrl })
        .eq("id", userId)

      if (error) {
        showMessage("プロフィールの更新に失敗しました。", "error")
        setUploading(false)
        e.target.value = ""
        return
      }

      if (currentAvatarUrl) {
        try {
          await fetch("/api/delete-object", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: currentAvatarUrl }),
          })
        } catch (delErr) {
          console.error("Failed to delete old avatar from R2:", delErr)
        }
      }

      setCurrentAvatarUrl(imageUrl)
      setAvatarUrl(`${imageUrl}?t=${new Date().getTime()}`)
      showMessage("アバター画像を更新しました。", "success")
      router.refresh()
    } catch (err) {
      console.error(err)
      showMessage("予期せぬエラーが発生しました。", "error")
    } finally {
      setUploading(false)
      e.target.value = ""
    }
  }

  const AvatarInner = () => (
    <>
      {avatarUrl ? (
        <Image
          src={avatarUrl}
          alt="Avatar"
          fill
          sizes="192px"
          priority
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div
          className="type-brand text-5xl text-subtle select-none tracking-wide flex items-center justify-center transition-transform duration-500 group-hover:scale-105"
          style={{ lineHeight: 1 }}
        >
          FD
        </div>
      )}

      {username && (
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <span className="text-[10px] text-white tracking-[0.2em] font-medium pl-[0.2em]">
            VIEW PROFILE
          </span>
        </div>
      )}
    </>
  )

  return (
    <div className="space-y-4 flex flex-col items-start">
      <div className="group relative w-48 h-48 rounded-full overflow-hidden border border-border bg-surface flex items-center justify-center">
        {username ? (
          <Link href={`/users/${username}`} className="absolute inset-0 w-full h-full flex items-center justify-center">
            <AvatarInner />
          </Link>
        ) : (
          <AvatarInner />
        )}
      </div>

      <div className="space-y-4 w-full max-w-sm pt-4">
        <div>
          <label className="inline-flex items-center gap-4 cursor-pointer">
            <span className="type-label text-sm px-6 py-4 border border-border rounded-xl bg-surface text-foreground hover:bg-foreground hover:text-background transition-colors duration-300">
              ファイルを選択
            </span>

            <span className="text-sm text-muted font-medium truncate max-w-[220px]">
              {fileName}
            </span>

            <input
              type="file"
              accept="image/*"
              onChange={handleUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
        </div>

        {uploading && (
          <p className="text-xs text-muted font-medium animate-pulse">
            アップロード中...
          </p>
        )}

        {statusMessage && (
          <div className={`text-xs p-3 rounded-xl border ${
            statusMessage.type === "error" 
              ? "text-red-500 bg-red-50/50 border-red-200" 
              : "text-foreground bg-neutral-50 border-border"
          }`}>
            {statusMessage.text}
          </div>
        )}
      </div>
    </div>
  )
}