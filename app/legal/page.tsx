import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "特定商取引法に基づく表記",
}

export default function LegalPage() {

  return (

    <main className="max-w-4xl mx-auto px-10 py-20">

      <h1 className="text-4xl">
        特定商取引法に基づく表記
      </h1>

      <div className="mt-14 space-y-10 text-[15px] leading-8">

        <section>

          <h2 className="text-lg mb-2">
            ■ 役務提供事業者
          </h2>

          <p>
            伊藤 與彬
          </p>

        </section>

        <section>

          <h2 className="text-lg mb-2">
            ■ 代表者（責任者）
          </h2>

          <p>
            伊藤 與彬
          </p>

        </section>

        <section>

          <h2 className="text-lg mb-2">
            ■ 所在地
          </h2>

          <p>
            〒060-0001 北海道札幌市中央区北一条西3丁目3番地33
            リープロビル302
          </p>

        </section>

        <section>

          <h2 className="text-lg mb-2">
            ■ お問い合わせ先（電話番号）
          </h2>

          <p>
            初回の問い合わせはメール（フォーム）にて一元管理しております。
            お電話での対応をご希望の場合は、お問い合わせフォームよりご請求いただければ、
            遅滞なく開示いたします。
          </p>

        </section>

        <section>

          <h2 className="text-lg mb-2">
            ■ お問い合わせ先（メールアドレス）
          </h2>

          <p>
            support@fashdb.com
          </p>

        </section>

        <section>

          <h2 className="text-lg mb-2">
            ■ 役務の対価（販売価格）
          </h2>

          <p>
            月額580円・税込
          </p>

        </section>

        <section>

          <h2 className="text-lg mb-2">
            ■ 対価以外に必要な費用
          </h2>

          <p>
            インターネット接続料金、通信料金等
            （システム利用のための通信費はお客様負担となります）
          </p>

        </section>

        <section>

          <h2 className="text-lg mb-2">
            ■ 代金の支払時期および支払方法
          </h2>

          <p>
            ・支払方法：クレジットカード決済（Stripe）
          </p>

          <p className="mt-2">
            ・支払時期：初回の課金日、および以降毎月同日に
            自動的に決済が行われます。
          </p>

        </section>

        <section>

          <h2 className="text-lg mb-2">
            ■ 役務の提供時期
          </h2>

          <p>
            決済手続きの完了後、即時
            （すぐにご利用いただけます）。
          </p>

        </section>

        <section>

          <h2 className="text-lg mb-2">
            ■ 返金・キャンセルについて
          </h2>

          <p>
            商品の性質上、決済完了後の返金・返品はお受けできません。
          </p>

          <p className="mt-4">
            解約を希望される場合は、
            次回課金日の前日までにマイページ（設定画面）より
            解約手続きを行ってください。
          </p>

          <p className="mt-4">
            解約手続き後も、
            当月分の有効期限までは引き続きサービスをご利用いただけます。
          </p>

        </section>

      </div>

    </main>
  )
}