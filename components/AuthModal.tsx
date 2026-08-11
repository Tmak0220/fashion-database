"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { useAuthModal } from "@/context/AuthModalContext"
import Link from "@/components/LocalizedLink"
import { useLocale } from "@/context/LocaleContext"

type StatusMessage = {
  text: string
  type: "error" | "success"
}

export default function AuthModal() {
  const router = useRouter()
  const { isOpen, closeAuthModal } = useAuthModal()
  const { t } = useLocale()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [statusMessage, setStatusMessage] = useState<StatusMessage | null>(null)
  const dialogRef = useRef<HTMLFormElement>(null)
  const emailRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!isOpen) return

    const previouslyFocused = document.activeElement as HTMLElement | null
    emailRef.current?.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeAuthModal()
        return
      }
      if (event.key !== "Tab") return

      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), a[href]'
      )
      if (!focusable?.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      previouslyFocused?.focus()
    }
  }, [isOpen, closeAuthModal])

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
        ref={dialogRef}
        onSubmit={handleModalLogin}
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        className="relative bg-white border border-border w-full max-w-sm p-6 sm:p-8 rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200"
      >
        <button 
          type="button"
          onClick={closeAuthModal}
          aria-label={t("閉じる")}
          className="absolute top-5 right-5 text-subtle hover:text-foreground text-xs p-1 transition-colors"
        >
          ✕
        </button>

        <div className="text-center">
          <h2 id="auth-modal-title" className="text-base font-semibold tracking-[0.05em] text-foreground">
            {t("ログインが必要です")}
          </h2>
          <p className="mt-3 text-xs text-muted leading-relaxed">
            {t("この機能は無料アカウントで利用できます。ログインするか、新規登録してください。")}
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-3.5">
          <input
            ref={emailRef}
            type="email"
            placeholder={t("メールアドレス")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="border border-border bg-white rounded-xl px-4 py-3 text-xs outline-none transition-colors focus:border-neutral-400 placeholder:text-neutral-300 text-foreground"
          />

          <input
            type="password"
            placeholder={t("パスワード")}
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
          {t(loading ? "ログイン中..." : "ログインする")}
        </button>

        <Link
          href="/login"
          onClick={closeAuthModal}
          className="mt-4 block text-center text-[11px] text-subtle underline underline-offset-4 hover:text-foreground transition-colors"
        >
          {t("無料アカウントを新規登録")}
        </Link>
      </form>
    </div>
  )
}
