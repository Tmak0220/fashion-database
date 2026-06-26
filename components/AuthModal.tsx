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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/30 backdrop-blur-[4px]" 
        onClick={closeAuthModal}
      />
      
      <form 
        onSubmit={handleModalLogin}
        className="relative bg-white border border-border w-full max-w-sm p-6 sm:p-8 rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200"
      >
        <button 
          type="button"
          onClick={closeAuthModal}
          className="absolute top-5 right-5 text-subtle hover:text-foreground text-xs p-1 transition-colors"
        >
          ✕
        </button>

        <div className="text-center">
          <h2 className="text-base font-semibold tracking-[0.05em] text-foreground">
            MEMBER限定機能
          </h2>
          <p className="mt-3 text-xs text-muted leading-relaxed">
            アーカイブの詳細や解説の閲覧、およびすべての機能を利用するにはMEMBER登録が必要です。
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-3.5">
          <input
            type="email"
            placeholder="メールアドレス"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="border border-border bg-white rounded-xl px-4 py-3 text-xs outline-none transition-colors focus:border-neutral-400 placeholder:text-neutral-300 text-foreground"
          />

          <input
            type="password"
            placeholder="パスワード"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="border border-border bg-white rounded-xl px-4 py-3 text-xs outline-none transition-colors focus:border-neutral-400 placeholder:text-neutral-300 text-foreground"
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
          className="mt-6 block w-full text-center bg-black text-white font-medium rounded-xl px-4 py-3 text-[12px] transition-colors duration-300 hover:bg-neutral-800 disabled:opacity-50"
        >
          {loading ? "ログイン中..." : "ログインする"}
        </button>

        <p className="mt-4 text-center text-[10px] text-subtle leading-relaxed">
          アカウントをお持ちでない場合は、トップページのメンバーシップ登録から新規登録を行ってください。
        </p>
      </form>
    </div>
  )
}