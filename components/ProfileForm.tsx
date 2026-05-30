"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"

type Props = {
  userId: string
  initialUsername: string | null
  initialBio: string | null
}

export default function ProfileForm({ userId, initialUsername, initialBio }: Props) {
  const [username, setUsername] = useState(initialUsername || "")
  const [bio, setBio] = useState(initialBio || "")
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from("users")
        .update({ username, bio })
        .eq("id", userId)

      if (error) {
        alert("プロフィールの保存に失敗しました。")
        return
      }

      alert("プロフィールを保存しました")
    } catch (err) {
      console.error(err)
      alert("予期せぬエラーが発生しました。")
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

      <div className="pt-4">
        <button onClick={handleSave} disabled={loading} className="border border-border rounded-xl px-6 py-4 hover:bg-black hover:text-white transition bg-white font-medium text-[14px]">
          {loading ? "保存中..." : "保存する"}
        </button>
      </div>
    </div>
  )
}