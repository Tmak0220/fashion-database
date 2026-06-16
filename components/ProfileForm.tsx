"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

type Props = {
  userId: string
  initialUsername: string | null
  initialBio: string | null
}

type StatusMessage = {
  text: string
  type: "error" | "success"
}

export default function ProfileForm({ userId, initialUsername, initialBio }: Props) {
  const router = useRouter()
  const [username, setUsername] = useState(initialUsername || "")
  const [bio, setBio] = useState(initialBio || "")
  const [loading, setLoading] = useState(false)
  const [statusMessage, setStatusMessage] = useState<StatusMessage | null>(null)

  const handleSave = async () => {
    setLoading(true)
    setStatusMessage(null)
    
    try {
      const { error } = await supabase
        .from("users")
        .update({ username, bio })
        .eq("id", userId)

      if (error) {
        setStatusMessage({ text: "プロフィールの保存に失敗しました。", type: "error" })
        setTimeout(() => {
          setStatusMessage(null)
        }, 3000)
        return
      }

      setStatusMessage({ text: "プロフィールを保存しました。", type: "success" })
      router.refresh()
      
      setTimeout(() => {
        setStatusMessage(null)
      }, 3000)
    } catch (err) {
      console.error(err)
      setStatusMessage({ text: "予期せぬエラーが発生しました。", type: "error" })
      setTimeout(() => {
        setStatusMessage(null)
      }, 3000)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm mb-2 tracking-[0.14em] text-muted font-medium">USERNAME</p>
        <input value={username} onChange={(e) => setUsername(e.target.value)} className="w-full border border-border rounded-xl px-4 py-3 bg-white" />
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