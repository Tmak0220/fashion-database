"use client"

import { createCheckoutSession } from "./actions"

export default function MembersPage() {

  const handleCheckout = async () => {
    try {
      const currentOrigin = window.location.origin
      
      // サーバーアクションを呼び出す（引数にuserIdを含める必要がなくなり安全です）
      const data = await createCheckoutSession(currentOrigin)

      if (data.error) {
        if (data.error === "Unauthorized") {
          alert("ログインセッションが切れたか、ログインしていません。もう一度ログインし直してください。")
        } else {
          alert("決済ページの読み込みに失敗しました")
        }
        return
      }

      // Stripeの決済ページ（checkout.stripe.com/...）へ安全にリダイレクト
      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.log(error)
      alert("通信エラーが発生しました")
    }
  }

  const plans = [
    {
      name: "FREE",
      nameJa: "無料版",
      price: "¥0",
      period: "/月",
      description: "基本的なアーカイブ閲覧機能",
      features: ["ブランド、デザイナーなどの説明の閲覧無制限", "画像投稿最大50枚まで閲覧"],
      button: "現在のプラン",
      disabled: true,
    },
    {
      name: "PLUS",
      nameJa: "PLUS MEMBER",
      price: "¥580",
      period: "/月",
      description: "より深くアーカイブを利用",
      features: ["画像閲覧無制限", "画像投稿無制限", "ユーザーのフォロ・いいね・ブックマーク機能"],
      button: "PLUSに登録",
      disabled: false,
      highlight: true,
    },
  ]

  return (
    <main className="min-h-screen p-10 md:p-14 lg:p-16">
      {/* heading */}
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
          今後、限定アーカイブや追加機能も順次公開予定です。
        </p>
      </div>

      {/* plans */}
      <section className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`
              border rounded-3xl p-8 bg-surface transition
              ${plan.highlight ? "border-black" : "border-border"}
            `}
          >
            {/* title */}
            <div>
              <p className="type-label text-[11px] text-subtle tracking-[0.12em]">{plan.nameJa}</p>
              <h2 className="mt-4 text-4xl font-medium">{plan.name}</h2>
            </div>

            {/* price */}
            <div className="mt-10 flex items-end gap-2">
              <span className="text-5xl font-medium">{plan.price}</span>
              <span className="pb-1 text-muted">{plan.period}</span>
            </div>

            <p className="mt-4 text-sm text-muted">{plan.description}</p>

            {/* button */}
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

            {/* features */}
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