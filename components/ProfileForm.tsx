"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

type Props = {
  userId: string
  initialUsername: string | null
  initialDisplayName: string | null
  initialBio: string | null
}

type StatusMessage = {
  text: string
  type: "error" | "success"
}

export default function ProfileForm({ userId, initialUsername, initialDisplayName, initialBio }: Props) {
  const router = useRouter()
  const [username, setUsername] = useState(initialUsername || "")
  const [displayName, setDisplayName] = useState(initialDisplayName || "")
  const [bio, setBio] = useState(initialBio || "")
  const [loading, setLoading] = useState(false)
  const [statusMessage, setStatusMessage] = useState<StatusMessage | null>(null)

  const showMessage = (text: string, type: "error" | "success") => {
    setStatusMessage({ text, type })
    setTimeout(() => {
      setStatusMessage(null)
    }, 3000)
  }

  const handleSave = async () => {
    setLoading(true)
    setStatusMessage(null)

    const trimmedUsername = username.trim()
    const trimmedDisplayName = displayName.trim()

    if (!trimmedUsername) {
      showMessage("ユーザー名を入力してください。", "error")
      setLoading(false)
      return
    }

    const usernameRegex = /^[a-zA-Z0-9_-]+$/
    if (!usernameRegex.test(trimmedUsername)) {
      showMessage("ユーザー名は半角英数字、ハイフン(-)、アンダースコア(_)のみ使用できます。", "error")
      setLoading(false)
      return
    }

    if (trimmedUsername.length < 3 || trimmedUsername.length > 20) {
      showMessage("ユーザー名は3文字以上、20文字以内で入力してください。", "error")
      setLoading(false)
      return
    }

    if (trimmedDisplayName.length > 30) {
      showMessage("表示名は30文字以内で入力してください。", "error")
      setLoading(false)
      return
    }
    
    try {
      const { error } = await supabase
        .from("users")
        .update({ 
          username: trimmedUsername, 
          display_name: trimmedDisplayName || null,
          bio 
        })
        .eq("id", userId)

      if (error) {
        if (error.code === "23505") {
          showMessage("このユーザー名はすでに使用されています。", "error")
        } else {
          showMessage("プロフィールの保存に失敗しました。", "error")
        }
        return
      }

      showMessage("プロフィールを保存しました。", "success")
      router.refresh()
    } catch (err) {
      console.error(err)
      showMessage("予期せぬエラーが発生しました。", "error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm mb-1 tracking-[0.14em] text-muted font-medium">DISPLAY NAME</p>
        <p className="text-xs text-muted mb-2">画面上に優先して表示される名前です (日本語可 / 30文字以内)</p>
        <input 
          value={displayName} 
          onChange={(e) => setDisplayName(e.target.value)} 
          className="w-full border border-border rounded-xl px-4 py-3 bg-white" 
          placeholder="山田 太郎"
        />
      </div>

      <div>
        <p className="text-sm mb-1 tracking-[0.14em] text-muted font-medium">USERNAME</p>
        <p className="text-xs text-muted mb-2">識別URL等に使用されます。半角英数字、ハイフン(-)、アンダースコア(_)のみ (3〜20文字)</p>
        <input 
          value={username} 
          onChange={(e) => setUsername(e.target.value)} 
          className="w-full border border-border rounded-xl px-4 py-3 bg-white" 
          placeholder="example_name"
        />
      </div>

      <div>
        <p className="text-sm mb-2 tracking-[0.14em] text-muted font-medium">BIO</p>
        <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={6} className="w-full border border-border rounded-xl px-4 py-3 bg-white" />
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

        <button onClick={handleSave} disabled={loading} className="border border-border rounded-xl px-6 py-4 hover:bg-black hover:text-white transition bg-white font-medium text-[14px]">
          {loading ? "保存中..." : "保存する"}
        </button>
      </div>
    </div>
  )
}