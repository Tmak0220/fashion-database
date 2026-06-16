"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import Link from "next/link"

type StatusMessage = {
  text: string
  type: "error" | "success"
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [statusMessage, setStatusMessage] = useState<StatusMessage | null>(null)

  const handleReset = async () => {
    if (!email || loading) return

    setLoading(true)
    setStatusMessage(null)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (error) {
      setStatusMessage({ text: error.message, type: "error" })
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        <div className="flex flex-col gap-2">
          <h1 className="type-brand text-[7.5vw] xs:text-3xl md:text-4xl tracking-[0.06em] md:tracking-[0.14em] uppercase whitespace-nowrap">
            Forgot Password
          </h1>
          <p className="text-xs tracking-[0.12em] text-muted font-medium uppercase">
            {sent ? "EMAIL SENT" : "パスワードの再設定"}
          </p>
        </div>

        <div className="mt-12">
          {sent ? (
            <p className="text-sm text-foreground leading-relaxed">
              再設定用のリンクを登録メールアドレスに送信しました。<br />
              受信トレイを確認してください。
            </p>
          ) : (
            <div className="flex flex-col gap-4">
              <p className="text-sm text-subtle mb-4">
                登録時のメールアドレスを入力してください。パスワード再設定用のリンクをお送りします。
              </p>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                inputMode="email"
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
                onClick={handleReset}
                disabled={loading}
                className="w-full border border-border rounded-xl px-6 py-4 text-sm tracking-[0.1em] bg-surface text-foreground hover:bg-foreground hover:text-background transition-colors duration-300 disabled:opacity-50"
              >
                {loading ? "SENDING..." : "再設定リンクを送信"}
              </button>
            </div>
          )}

          <div className="mt-8 text-center">
            <Link 
              href="/auth" 
              className="text-xs tracking-[0.06em] text-subtle hover:text-foreground transition-colors"
            >
              ログイン画面に戻る
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}