"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { useAuthModal } from "@/context/AuthModalContext"

type StatusMessage = {
  text: string
  type: "error" | "success"
}

export default function AuthModal() {
  const router = useRouter()
  const { isOpen, closeAuthModal } = useAuthModal()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [statusMessage, setStatusMessage] = useState<StatusMessage | null>(null)

  if (!isOpen) return null

  const handleModalLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setStatusMessage(null)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setLoading(false)
      setStatusMessage({ 
        text: error.status === 400 ? "メールアドレスまたはパスワードが正しくありません。" : "ログインに失敗しました。もう一度お試しください。", 
        type: "error" 
      })
      return
    }

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setLoading(false)
      setStatusMessage({ text: "ユーザー情報の取得に失敗しました", type: "error" })
      return
    }

    const { error: profileError } = await supabase
      .from("users")
      .upsert({
        id: user.id,
        email: user.email,
      })

    if (profileError) {
      console.log(profileError)
    }

    setLoading(false)
    closeAuthModal()
    router.refresh()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black/30 backdrop-blur-[4px]" 
        onClick={closeAuthModal}
      />
      
      <form 
        onSubmit={handleModalLogin}
        className="relative bg-white border border-border w-full max-w-md p-8 rounded-2xl shadow-2xl mx-4 animate-in fade-in zoom-in-95 duration-200"
      >
        <button 
          type="button"
          onClick={closeAuthModal}
          className="absolute top-5 right-5 text-subtle hover:text-foreground text-xs p-1 transition-colors"
        >
          ✕
        </button>

        <div className="text-center">
          <h2 className="text-base font-semibold tracking-[0.05em] text-foreground uppercase">
            MEMBERS ONLY
          </h2>
          <p className="mt-3 text-xs text-muted leading-relaxed max-w-[280px] mx-auto">
            ブランドのフォローや限定コンテンツを閲覧するにはログインが必要です。
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-3.5">
          <input
            type="email"
            placeholder="EMAIL"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="border border-border bg-white rounded-xl px-4 py-3.5 outline-none text-sm transition-colors focus:border-neutral-400 placeholder:text-neutral-300 text-foreground"
          />

          <input
            type="password"
            placeholder="PASSWORD"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="border border-border bg-white rounded-xl px-4 py-3.5 outline-none text-sm transition-colors focus:border-neutral-400 placeholder:text-neutral-300 text-foreground"
          />
        </div>

        {statusMessage && (
          <div className={`mt-4 text-xs p-3 rounded-xl border ${
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
          className="mt-6 w-full border border-border rounded-xl px-8 py-3 text-xs font-medium tracking-[0.1em] uppercase bg-white text-foreground hover:bg-foreground hover:text-background hover:border-foreground transition duration-200 active:scale-[0.98] disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="mt-6 text-center text-[10px] text-subtle leading-relaxed px-2">
          アカウントをお持ちでない場合は、トップページ上のMEMBERSHIPボタンから新規登録を行ってください。
        </p>
      </form>
    </div>
  )
}