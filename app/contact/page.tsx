import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "お問い合わせ",
}

export default function ContactPage() {

  return (

    <main className="max-w-4xl mx-auto px-10 py-20">

      <h1 className="text-4xl">
        お問い合わせ
      </h1>

      <div className="mt-10 space-y-6 leading-8 text-[15px]">

        <p>
          お問い合わせは
          以下のメールアドレスまで
          ご連絡ください。
        </p>

        <p>
          support@fashdb.com
        </p>

      </div>

    </main>
  )
}