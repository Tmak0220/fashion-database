"use client"

import { useState } from "react"
import { createCheckoutSession } from "./actions"

type StatusMessage = {
  text: string
  type: "error" | "success"
}

export default function MembersPage() {
  const [statusMessage, setStatusMessage] = useState<StatusMessage | null>(null)

  const handleCheckout = async () => {
    try {
      setStatusMessage(null)
      const currentOrigin = window.location.origin
      
      const data = await createCheckoutSession(currentOrigin)

      if (data.error) {
        if (data.error === "Unauthorized") {
          setStatusMessage({
            text: "ログインセッションが切れたか、ログインしていません。もう一度ログインし直してください。",
            type: "error"
          })
        } else {
          setStatusMessage({ text: "決済ページの読み込みに失敗しました", type: "error" })
        }
        return
      }

      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.log(error)
      setStatusMessage({ text: "通信エラーが発生しました", type: "error" })
    }
  }

  const plans = [
    {
      name: "FREE",
      nameJa: "無料プラン",
      price: "¥0",
      period: "/月",
      description: "文章・画像の閲覧を中心とした基本プラン",
      features: [
        "ブランド・デザイナー情報の閲覧（無制限）",
        "アーカイブ画像の閲覧（無制限）",
        "※タイトル・解説テキストの閲覧、投稿、各種インタラクション機能（お気に入り・保存・フォロー）はご利用いただけません"
      ],
      button: "現在のプラン",
      disabled: true,
    },
    {
      name: "PLUS",
      nameJa: "PLUS MEMBER",
      price: "¥580",
      period: "/月",
      description: "すべてのアーカイブと機能がご利用いただける上位プラン",
      features: [
        "画像・タイトル・詳細解説のすべてを閲覧（無制限）",
        "自身のアーカイブ画像の投稿（無制限）",
        "インタラクション機能（お気に入り・ブックマーク・ユーザーフォロー）の利用"
      ],
      button: "PLUSに登録",
      disabled: false,
      highlight: true,
    },
  ]

  return (
    <main className="min-h-screen max-w-6xl mx-auto p-6 sm:p-10 md:p-14 lg:p-16">
      <div className="max-w-3xl">
        <p className="type-label text-[11px] text-subtle tracking-[0.12em] uppercase font-medium">
          Membership
        </p>
        <h1 className="mt-4 sm:mt-6 text-4xl sm:text-5xl md:text-6xl tracking-[0.05em] text-foreground font-light break-words">
          MEMBERSHIP
        </h1>
        <p className="mt-2 text-xs sm:text-sm tracking-[0.12em] text-muted font-medium">
          メンバーシップ
        </p>
        <p className="mt-6 sm:mt-8 text-xs sm:text-[14px] md:text-[15px] leading-relaxed sm:leading-7 md:leading-8 text-muted">
          ファッションデータベースをより深く利用するためのメンバーシッププランです。
        </p>
      </div>

      {statusMessage && (
        <div className={`mt-8 sm:mt-12 text-xs p-4 rounded-xl border ${
          statusMessage.type === "error" 
            ? "text-red-500 bg-red-50/50 border-red-200" 
            : "text-foreground bg-neutral-50 border-border"
        }`}>
          {statusMessage.text}
        </div>
      )}

      <section className="mt-8 sm:mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`
              border rounded-2xl sm:rounded-3xl p-6 sm:p-8 bg-surface flex flex-col justify-between transition
              ${plan.highlight ? "border-black" : "border-border"}
            `}
          >
            <div>
              <div>
                <p className="type-label text-[10px] sm:text-[11px] text-subtle tracking-[0.12em] font-medium">{plan.nameJa}</p>
                <h2 className="mt-2 sm:mt-4 text-3xl sm:text-4xl font-medium tracking-[0.02em]">{plan.name}</h2>
              </div>

              <div className="mt-8 sm:mt-10 flex items-end gap-1.5">
                <span className="text-4xl sm:text-5xl font-medium leading-none tracking-tight">{plan.price}</span>
                <span className="pb-0.5 text-xs sm:text-sm text-muted font-medium">{plan.period}</span>
              </div>

              <p className="mt-4 text-xs sm:text-sm text-muted leading-relaxed">{plan.description}</p>
            </div>

            <div>
              <div className="mt-8 sm:mt-10">
                {plan.disabled ? (
                  <div className="w-full border border-border rounded-xl px-5 py-3.5 text-center text-xs sm:text-sm text-subtle bg-neutral-50 font-medium">
                    {plan.button}
                  </div>
                ) : (
                  <button
                    onClick={handleCheckout}
                    className="block w-full border border-black bg-black text-white rounded-xl px-5 py-3.5 text-center text-xs sm:text-sm tracking-[0.08em] font-medium transition hover:bg-neutral-800 active:scale-[0.99]"
                  >
                    {plan.button}
                  </button>
                )}
              </div>

              <div className="mt-8 sm:mt-10 space-y-4 sm:space-y-5 border-t border-dashed border-border pt-6 sm:pt-8">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-start gap-2.5 sm:gap-3">
                    <div className="mt-[6px] sm:mt-[7px] h-[4px] w-[4px] sm:h-[5px] sm:w-[5px] rounded-full bg-foreground shrink-0" />
                    <p className="text-[11px] sm:text-xs md:text-sm leading-relaxed text-muted">{feature}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </section>
    </main>
  )
}