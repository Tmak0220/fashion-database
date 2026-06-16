"use client"

import { useState, FormEvent } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

type StatusMessage = {
  text: string
  type: "error" | "success"
}

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [statusMessage, setStatusMessage] = useState<StatusMessage | null>(null)

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setStatusMessage(null)

    const { error } = await supabase.auth.updateUser({
      password,
    })

    if (error) {
      setStatusMessage({ text: `エラーが発生しました: ${error.message}`, type: "error" })
      setLoading(false)
    } else {
      setStatusMessage({ text: "パスワードが正常に更新されました。画面を切り替えています...", type: "success" })
      setTimeout(() => {
        router.push("/auth")
      }, 2000)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        <div className="flex flex-col gap-2">
          <h1 className="type-brand text-3xl md:text-4xl tracking-[0.14em] pr-[0.14em] uppercase">
            Reset Password
          </h1>
          <p className="text-xs tracking-[0.12em] text-muted font-medium uppercase">
            新しいパスワードの設定
          </p>
        </div>

        <form onSubmit={handleUpdate} className="mt-12 flex flex-col gap-4">
          <input
            type="password"
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            required
            className="w-full border border-border bg-surface rounded-xl px-5 py-4 outline-none text-sm transition-colors focus:border-muted text-foreground"
          />

          {statusMessage && (
            <div className={`text-xs p-4 rounded-xl border ${
              statusMessage.type === "error" 
                ? "text-red-500 bg-red-50/50 border-red-200" 
                : "text-foreground bg-neutral-50 border-border"
            }`}>
              {statusMessage.text}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full border border-border rounded-xl px-6 py-4 text-sm tracking-[0.1em] bg-surface text-foreground hover:bg-foreground hover:text-background transition-colors duration-300 disabled:opacity-50"
          >
            {loading ? "UPDATING..." : "パスワードを更新"}
          </button>
        </form>
      </div>
    </main>
  )
}