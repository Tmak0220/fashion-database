"use client"

import { useState } from "react"

export default function ContactForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setStatus("loading")

    const formData = new FormData(e.currentTarget)
    const data = Object.fromEntries(formData.entries())

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        setStatus("success")
        ;(e.target as HTMLFormElement).reset()
      } else {
        setStatus("error")
      }
    } catch (error) {
      console.error(error)
      setStatus("error")
    }
  }

  return (
    <div className="mt-12 max-w-xl">
      {status === "success" ? (
        <div className="p-6 border border-border bg-neutral-50 rounded-2xl text-sm leading-relaxed text-foreground">
          <p className="font-medium">お問い合わせを受け付けました。</p>
          <p className="mt-2 text-muted text-xs">通常2〜3営業日以内にご返信いたします。</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 【スパム対策】ハニーポットフィールド（画面には絶対に見えない） */}
          <div className="hidden" aria-hidden="true">
            <input type="text" name="honey" tabIndex={-1} autoComplete="off" />
          </div>

          <div className="space-y-2">
            <label htmlFor="name" className="block text-xs font-medium uppercase tracking-wider text-foreground">お名前</label>
            <input type="text" id="name" name="name" required className="w-full border border-border rounded-xl px-4 py-3 text-sm bg-background" placeholder="山本 太郎" />
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="block text-xs font-medium uppercase tracking-wider text-foreground">メールアドレス</label>
            <input type="type" id="email" name="email" required className="w-full border border-border rounded-xl px-4 py-3 text-sm bg-background" placeholder="your@email.com" />
          </div>

          <div className="space-y-2">
            <label htmlFor="message" className="block text-xs font-medium uppercase tracking-wider text-foreground">お問い合わせ内容</label>
            <textarea id="message" name="message" required rows={6} className="w-full border border-border rounded-xl px-4 py-3 text-sm bg-background resize-none" placeholder="ご質問やご要望をご記入ください。" />
          </div>

          {status === "error" && (
            <p className="text-xs text-red-500">送信に失敗しました。直接メールにてご連絡ください。</p>
          )}

          <button
            type="submit"
            disabled={status === "loading"}
            className="border border-border rounded-xl px-8 py-3 text-xs tracking-wider font-medium bg-surface text-foreground hover:bg-black hover:text-white transition duration-200 disabled:opacity-50"
          >
            {status === "loading" ? "送信中..." : "内容を送信する"}
          </button>
        </form>
      )}
    </div>
  )
}