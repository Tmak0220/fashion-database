import type { Metadata } from "next"
import ContactForm from "@/components/ContactForm"

export const metadata: Metadata = {
  title: "コンタクト - FASHION DATABASE",
}

export default function ContactPage() {
  return (
    <main className="max-w-4xl mx-auto p-6 sm:p-10 md:p-14 lg:p-16 animate-[fadeIn_0.3s_ease-out_forwards]">
      <div className="border-b border-border pb-6">
        <h1 className="text-2xl tracking-[0.12em] font-medium text-foreground uppercase flex flex-col gap-1">
          CONTACT
          <span className="text-[10px] tracking-[0.05em] font-normal text-muted lowercase">
            お問い合わせ
          </span>
        </h1>
      </div>

      <div className="mt-8 space-y-3 leading-relaxed text-xs text-subtle font-medium">
        <p>
          サービスに関するご質問、ご要望などございましたら、以下のフォームまたはメールアドレスよりご連絡ください。
        </p>
        <p className="text-foreground tracking-wide font-semibold block pt-1 selection:bg-neutral-100">
          contact@pct-e.com
        </p>
      </div>

      <div className="mt-12 bg-surface">
        <ContactForm />
      </div>
    </main>
  )
}