import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "プライバシーポリシー",
}

export default function PrivacyPage() {

  return (

    <main className="max-w-4xl mx-auto px-10 py-20">

      <h1 className="text-4xl">
        プライバシーポリシー
      </h1>

      <div className="mt-14 space-y-12 text-[15px] leading-8">

        {/* 基本方針 */}

        <section>

          <h2 className="text-xl mb-3">
            基本方針
          </h2>

          <p>
            当サイトは、
            ユーザーの個人情報の重要性を認識し、
            個人情報保護に関する法令を遵守するとともに、
            適切な管理・保護に努めます。
          </p>

        </section>

        {/* 取得する情報 */}

        <section>

          <h2 className="text-xl mb-3">
            取得する情報
          </h2>

          <p>
            当サイトでは、
            アカウント登録、決済、投稿機能等の利用にあたり、
            以下の情報を取得する場合があります。
          </p>

          <ul className="list-disc pl-6 mt-4 space-y-1">

            <li>
              メールアドレス
            </li>

            <li>
              ユーザー名
            </li>

            <li>
              投稿画像・投稿内容
            </li>

            <li>
              IPアドレス
            </li>

            <li>
              ブラウザ情報
            </li>

            <li>
              Cookie情報
            </li>

          </ul>

        </section>

        {/* Supabase */}

        <section>

          <h2 className="text-xl mb-3">
            認証・データ管理について
          </h2>

          <p>
            当サイトでは、
            ユーザー認証およびデータ管理のために
            Supabaseを利用しています。
          </p>

          <p className="mt-4">
            アカウント情報や投稿データは、
            Supabaseの提供するインフラ上で
            安全に管理されます。
          </p>

        </section>

        {/* Stripe */}

        <section>

          <h2 className="text-xl mb-3">
            決済について
          </h2>

          <p>
            当サイトでは、
            有料会員サービスの決済処理に
            Stripeを利用しています。
          </p>

          <p className="mt-4">
            クレジットカード情報は
            当サイト側では保持せず、
            Stripeによって安全に処理されます。
          </p>

        </section>

        {/* Google */}

        <section>

          <h2 className="text-xl mb-3">
            アクセス解析について
          </h2>

          <p>
            当サイトでは、
            サービス改善および利用状況分析のため、
            Google Analytics、
            Google Search Console、
            Vercel Analyticsを利用する場合があります。
          </p>

          <p className="mt-4">
            これらのツールでは、
            Cookieを利用して匿名のトラフィックデータを
           収集することがあります。
          </p>

          <p className="mt-4">
            収集されるデータには、
            個人を特定する情報は含まれません。
          </p>

        </section>

        {/* Cloudflare */}

        <section>

          <h2 className="text-xl mb-3">
            セキュリティ・配信について
          </h2>

          <p>
            当サイトでは、
            セキュリティ向上および高速配信のために
            Cloudflareを利用しています。
          </p>

          <p className="mt-4">
            不正アクセス対策や
            サイト保護のため、
            IPアドレス等の情報が処理される場合があります。
          </p>

        </section>

        {/* Cookie */}

        <section>

          <h2 className="text-xl mb-3">
            Cookieについて
          </h2>

          <p>
            当サイトでは、
            利便性向上やログイン状態保持のため、
            Cookieを利用する場合があります。
          </p>

          <p className="mt-4">
            Cookieは、
            ブラウザ設定により無効化することが可能です。
          </p>

        </section>

        {/* 第三者提供 */}

        <section>

          <h2 className="text-xl mb-3">
            第三者提供について
          </h2>

          <p>
            法令に基づく場合を除き、
            ユーザー情報を本人の同意なく
            第三者へ提供することはありません。
          </p>

        </section>

        {/* 改定 */}

        <section>

          <h2 className="text-xl mb-3">
            ポリシーの改定
          </h2>

          <p>
            本ポリシーは、
            必要に応じて変更される場合があります。
          </p>

        </section>

      </div>

    </main>
  )
}