"use client"

import { useState, FormEvent } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.auth.updateUser({
      password,
    })

    if (error) {
      alert(`エラーが発生しました: ${error.message}`)
    } else {
      alert("パスワードが正常に更新されました。")
      router.push("/auth")
    }

    setLoading(false)
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