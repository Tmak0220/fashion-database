import type { Metadata } from "next"
import ContactForm from "@/components/ContactForm"
import { getRequestLocale, localizedAlternates } from "@/lib/locale-server"
import { translateText } from "@/lib/i18n"

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale()
  return {
    title: locale === "en" ? "Contact - FASHION DATABASE" : "お問い合わせ - FASHION DATABASE",
    alternates: await localizedAlternates("/contact"),
  }
}

export default async function ContactPage() {
  const locale = await getRequestLocale()
  const t = (text: string) => translateText(text, locale)

  return (
    <main className="max-w-4xl mx-auto p-6 sm:p-10 md:p-14 lg:p-16 animate-[fadeIn_0.3s_ease-out_forwards]">
      <div className="border-b border-border pb-6">
        <h1 className="text-2xl tracking-[0.12em] font-medium text-foreground uppercase flex flex-col gap-1">
          CONTACT
          <span className="text-[10px] tracking-[0.05em] font-normal text-muted lowercase">
            {t("お問い合わせ")}
          </span>
        </h1>
      </div>

      <div className="mt-8 space-y-3 leading-relaxed text-xs text-subtle font-medium">
        <p>
          {t("サービスに関するご質問、ご要望などございましたら、以下のフォームまたはメールアドレスよりご連絡ください。")}
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
