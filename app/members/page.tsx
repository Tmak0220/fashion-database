"use client"

import { useLocale } from "@/context/LocaleContext"

export default function MembersPage() {
  const { t } = useLocale()
  const plans = [
    {
      name: "FREE",
      nameJa: "無料プラン",
      price: "¥0",
      period: "/月",
      description: "すべてのアーカイブを自由に閲覧できる基本プラン",
      features: [
        "ブランド・デザイナー情報の閲覧（無制限）",
        "画像・タイトル・詳細解説の閲覧（無制限）",
        "画像投稿・いいね・ブックマーク・フォロー"
      ],
      button: "現在のプラン",
      disabled: true,
    },
    {
      name: "PLUS",
      nameJa: "PLUS MEMBER",
      price: "—",
      period: "/月",
      description: "将来追加する便利機能のためのプラン（現在準備中）",
      features: [
        "基本機能を制限しない追加機能を検討中",
        "提供内容が決まり次第、このページでお知らせします"
      ],
      button: "準備中",
      disabled: true,
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
          {t("メンバーシップ")}
        </p>
        <p className="mt-6 sm:mt-8 text-xs sm:text-[14px] md:text-[15px] leading-relaxed sm:leading-7 md:leading-8 text-muted">
          {t("閲覧・投稿・保存・フォローなどの基本機能は無料で利用できます。PLUSは現在、新しい便利機能を検討中です。")}
        </p>
      </div>

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
                <p className="type-label text-[10px] sm:text-[11px] text-subtle tracking-[0.12em] font-medium">{t(plan.nameJa)}</p>
                <h2 className="mt-2 sm:mt-4 text-3xl sm:text-4xl font-medium tracking-[0.02em]">{plan.name}</h2>
              </div>

              <div className="mt-8 sm:mt-10 flex items-end gap-1.5">
                <span className="text-4xl sm:text-5xl font-medium leading-none tracking-tight">{plan.price}</span>
                <span className="pb-0.5 text-xs sm:text-sm text-muted font-medium">{t(plan.period)}</span>
              </div>

              <p className="mt-4 text-xs sm:text-sm text-muted leading-relaxed">{t(plan.description)}</p>
            </div>

            <div>
              <div className="mt-8 sm:mt-10">
                {plan.disabled ? (
                  <div className="w-full border border-border rounded-xl px-5 py-3.5 text-center text-xs sm:text-sm text-subtle bg-neutral-50 font-medium">
                    {t(plan.button)}
                  </div>
                ) : null}
              </div>

              <div className="mt-8 sm:mt-10 space-y-4 sm:space-y-5 border-t border-dashed border-border pt-6 sm:pt-8">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-start gap-2.5 sm:gap-3">
                    <div className="mt-[6px] sm:mt-[7px] h-[4px] w-[4px] sm:h-[5px] sm:w-[5px] rounded-full bg-foreground shrink-0" />
                    <p className="text-[11px] sm:text-xs md:text-sm leading-relaxed text-muted">{t(feature)}</p>
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
