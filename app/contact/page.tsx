import type { Metadata } from "next"
import ContactForm from "@/components/ContactForm" // コンポーネントの配置場所に合わせて調整してください

export const metadata: Metadata = {
  title: "お問い合わせ",
}

export default function ContactPage() {
  return (
    <main className="max-w-4xl mx-auto px-10 py-20">
      <h1 className="text-3xl sm:text-4xl font-medium tracking-wide text-foreground">
        お問い合わせ
      </h1>

      <div className="mt-8 space-y-2 leading-7 text-[14px] text-muted">
        <p>
          サービスに関するご質問、ご要望などございましたら、以下のフォームまたはメールアドレスよりご連絡ください。
        </p>
        <p className="font-medium text-foreground">
          support@fashdb.com
        </p>
      </div>

      <hr className="mt-10 border-border" />

      {/* フォームコンポーネントの呼び出し */}
      <ContactForm />
    </main>
  )
}