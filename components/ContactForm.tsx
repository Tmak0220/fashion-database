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
    <div className="mt-12 max-w-4xl mx-auto">
      {status === "success" ? (
        <div className="p-6 border border-border bg-neutral-50 rounded-2xl text-sm leading-relaxed text-foreground">
          <p className="font-medium">お問い合わせを受け付けました。</p>
          <p className="mt-2 text-muted text-xs">通常2〜3営業日以内にご返信いたします。</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="hidden" aria-hidden="true">
            <input type="text" name="honey" tabIndex={-1} autoComplete="off" />
          </div>

          <div>
            <p className="text-sm mb-1 tracking-[0.14em] text-muted font-medium">NAME</p>
            <p className="text-xs text-muted mb-2">お名前を入力してください</p>
            <input type="text" id="name" name="name" required className="w-full border border-border rounded-xl px-4 py-3 bg-[#f5f4f2] text-foreground focus:outline-neutral-400 placeholder:text-neutral-400/70" placeholder="Name" />
          </div>

          <div>
            <p className="text-sm mb-1 tracking-[0.14em] text-muted font-medium">EMAIL</p>
            <p className="text-xs text-muted mb-2">返信先のメールアドレスを入力してください</p>
            <input type="email" id="email" name="email" required className="w-full border border-border rounded-xl px-4 py-3 bg-[#f5f4f2] text-foreground focus:outline-neutral-400 placeholder:text-neutral-400/70" placeholder="mail@example.com" />
          </div>

          <div>
            <p className="text-sm mb-1 tracking-[0.14em] text-muted font-medium">MESSAGE</p>
            <p className="text-xs text-muted mb-2">ご質問やご要望、お気づきの点などをご記入ください</p>
            <textarea id="message" name="message" required rows={6} className="w-full border border-border rounded-xl px-4 py-3 bg-[#f5f4f2] text-foreground focus:outline-neutral-400 placeholder:text-neutral-400/70 resize-none leading-relaxed" placeholder="ご質問やご要望をご記入ください。" />
          </div>

          {status === "error" && (
            <p className="text-xs text-red-500">送信に失敗しました。直接メールにてご連絡ください。</p>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={status === "loading"}
              className="border border-border rounded-xl px-6 py-4 font-medium text-[14px] bg-white text-foreground hover:bg-black hover:text-white transition duration-200 active:scale-[0.98] disabled:opacity-50"
            >
              {status === "loading" ? "送信中..." : "内容を送信する"}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}