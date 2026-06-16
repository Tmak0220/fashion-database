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

  const handleModalLogin = async () => {
    setLoading(true)
    setStatusMessage(null)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setLoading(false)
      setStatusMessage({ text: error.message, type: "error" })
      return
    }

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setLoading(false)
      setStatusMessage({ text: "ログインに失敗しました", type: "error" })
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
        className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
        onClick={closeAuthModal}
      />
      
      <div className="relative bg-surface border border-border w-full max-w-md p-8 rounded-2xl shadow-xl mx-4 animate-in fade-in zoom-in-95 duration-200">
        <button 
          onClick={closeAuthModal}
          className="absolute top-4 right-4 text-subtle hover:text-foreground text-sm font-medium"
        >
          ✕
        </button>

        <div className="text-center">
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            MEMBER限定機能です
          </h2>
          <p className="mt-2 text-sm text-muted leading-relaxed">
            ブランドのフォローや限定コンテンツを閲覧するにはログインが必要です。
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border border-border bg-background rounded-xl px-5 py-4 outline-none text-sm transition-colors focus:border-muted text-foreground"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border border-border bg-background rounded-xl px-5 py-4 outline-none text-sm transition-colors focus:border-muted text-foreground"
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
          onClick={handleModalLogin}
          disabled={loading}
          className="type-ui mt-6 w-full border border-border rounded-xl px-6 py-4 text-sm tracking-[0.1em] bg-background text-foreground hover:bg-foreground hover:text-background transition-colors duration-300 disabled:opacity-50"
        >
          {loading ? "LOADING..." : "ログイン"}
        </button>

        <p className="mt-6 text-center text-xs text-subtle">
          アカウントをお持ちでない場合は、トップページ上のMEMBERSHIPボタンから新規登録を行ってください。
        </p>
      </div>
    </div>
  )
}