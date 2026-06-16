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
    <main className="min-h-screen p-10 md:p-14 lg:p-16">
      <div className="max-w-3xl">
        <p className="type-label text-[11px] text-subtle" style={{ letterSpacing: "0.12em", paddingRight: "0.12em" }}>
          MEMBERSHIP
        </p>
        <h1 className="mt-8 type-display text-5xl md:text-6xl text-foreground">
          MEMBERSHIP
        </h1>
        <p className="mt-4 text-base tracking-[0.12em] text-muted font-medium">
          メンバーシップ
        </p>
        <p className="mt-8 max-w-2xl text-[15px] leading-8 text-muted">
          ファッションデータベースをより深く利用するための
          メンバーシッププランです。
        </p>
      </div>

      {statusMessage && (
        <div className={`mt-12 max-w-5xl text-xs p-4 rounded-xl border ${
          statusMessage.type === "error" 
            ? "text-red-500 bg-red-50/50 border-red-200" 
            : "text-foreground bg-neutral-50 border-border"
        }`}>
          {statusMessage.text}
        </div>
      )}

      <section className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`
              border rounded-3xl p-8 bg-surface transition
              ${plan.highlight ? "border-black" : "border-border"}
            `}
          >
            <div>
              <p className="type-label text-[11px] text-subtle tracking-[0.12em]">{plan.nameJa}</p>
              <h2 className="mt-4 text-4xl font-medium">{plan.name}</h2>
            </div>

            <div className="mt-10 flex items-end gap-2">
              <span className="text-5xl font-medium">{plan.price}</span>
              <span className="pb-1 text-muted">{plan.period}</span>
            </div>

            <p className="mt-4 text-sm text-muted">{plan.description}</p>

            <div className="mt-10">
              {plan.disabled ? (
                <div className="w-full border border-border rounded-xl px-6 py-4 text-center text-sm text-subtle bg-neutral-100">
                  {plan.button}
                </div>
              ) : (
                <button
                  onClick={handleCheckout}
                  className="block w-full border border-black bg-black text-white rounded-xl px-6 py-4 text-center text-sm tracking-[0.08em] transition hover:opacity-80"
                >
                  {plan.button}
                </button>
              )}
            </div>

            <div className="mt-10 space-y-5">
              {plan.features.map((feature) => (
                <div key={feature} className="flex items-start gap-3">
                  <div className="mt-[7px] h-[5px] w-[5px] rounded-full bg-black" />
                  <p className="text-sm leading-7 text-muted">{feature}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>
    </main>
  )
}