import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "利用規約",
}

export default function TermsPage() {

  return (

    <main className="max-w-4xl mx-auto px-10 py-20">

      <h1 className="text-4xl">
        利用規約
      </h1>

      <div className="mt-14 space-y-12 text-[15px] leading-8">

        {/* 第1条 */}

        <section>

          <h2 className="text-xl mb-3">
            第1条（目的）
          </h2>

          <p>
            本規約は、
            当サイトが提供するサービス
            （以下「本サービス」）の
            利用条件を定めるものです。
          </p>

          <p className="mt-4">
            ユーザーは、
            本規約に同意した上で
            本サービスを利用するものとします。
          </p>

        </section>

        {/* 第2条 */}

        <section>

          <h2 className="text-xl mb-3">
            第2条（サービス内容）
          </h2>

          <p>
            本サービスは、
            ファッションブランド、
            デザイナー、
            コレクション、
            ヴィンテージアイテム等に関する
            情報の整理・保存・共有を目的とした
            アーカイブサービスです。
          </p>

        </section>

        {/* 第3条 */}

        <section>

          <h2 className="text-xl mb-3">
            第3条（会員登録）
          </h2>

          <p>
            一部機能の利用には、
            アカウント登録が必要です。
          </p>

          <p className="mt-4">
            ユーザーは、
            正確かつ最新の情報を登録するものとします。
          </p>

          <p className="mt-4">
            虚偽情報による登録、
            なりすまし登録、
            不正利用を目的とした登録は禁止します。
          </p>

        </section>

        {/* 第4条 */}

        <section>

          <h2 className="text-xl mb-3">
            第4条（有料会員）
          </h2>

          <p>
            本サービスには、
            有料会員機能
            「PLUS MEMBER」が含まれます。
          </p>

          <p className="mt-4">
            有料会員は、
            月額料金を支払うことで、
            投稿機能、
            ブックマーク機能、
            高画質閲覧機能等を利用できます。
          </p>

          <p className="mt-4">
            決済にはStripeを利用します。
          </p>

        </section>

        {/* 第5条 */}

        <section>

          <h2 className="text-xl mb-3">
            第5条（禁止事項）
          </h2>

          <p>
            ユーザーは、
            以下の行為を行ってはなりません。
          </p>

          <ul className="list-disc pl-6 mt-4 space-y-2">

            <li>
              法令または公序良俗に違反する行為
            </li>

            <li>
              他者の権利を侵害する行為
            </li>

            <li>
              虚偽情報の登録
            </li>

            <li>
              他者になりすます行為
            </li>

            <li>
              他者の画像・著作物を無断転載する行為
            </li>

            <li>
              生成AIによる偽造画像を投稿する行為
            </li>

            <li>
              サービス運営を妨害する行為
            </li>

            <li>
              不正アクセスまたはその試行
            </li>

            <li>
              スパム投稿
            </li>

            <li>
              明らかに無関係なデータ登録
            </li>

            <li>
              運営が不適切と判断する行為
            </li>

          </ul>

        </section>

        {/* 第6条 */}

        <section>

          <h2 className="text-xl mb-3">
            第6条（投稿コンテンツ）
          </h2>

          <p>
            ユーザーは、
            自身が権利を有する画像・情報のみを
            投稿できるものとします。
          </p>

          <p className="mt-4">
            投稿内容に関する責任は、
            投稿したユーザー自身が負うものとします。
          </p>

          <p className="mt-4">
            運営は、
            本サービス維持のため必要と判断した場合、
            投稿内容を削除または非公開化できるものとします。
          </p>

        </section>

        {/* 第7条 */}

        <section>

          <h2 className="text-xl mb-3">
            第7条（知的財産権）
          </h2>

          <p>
            本サービスに含まれる
            テキスト、
            デザイン、
            システム、
            ロゴ等の権利は、
            運営者または権利者に帰属します。
          </p>

        </section>

        {/* 第8条 */}

        <section>

          <h2 className="text-xl mb-3">
            第8条（退会）
          </h2>

          <p>
            ユーザーは、
            所定の方法により退会できます。
          </p>

          <p className="mt-4">
            運営は、
            規約違反が確認された場合、
            アカウント停止または強制退会を行えるものとします。
          </p>

        </section>

        {/* 第9条 */}

        <section>

          <h2 className="text-xl mb-3">
            第9条（免責事項）
          </h2>

          <p>
            運営は、
            本サービスの正確性、
            完全性、
            継続性を保証するものではありません。
          </p>

          <p className="mt-4">
            本サービス利用により生じた損害について、
            運営は故意または重大な過失がある場合を除き、
            責任を負わないものとします。
          </p>

        </section>

        {/* 第10条 */}

        <section>

          <h2 className="text-xl mb-3">
            第10条（サービス変更・停止）
          </h2>

          <p>
            運営は、
            必要に応じて、
            本サービスの内容変更、
            一時停止、
            終了を行うことがあります。
          </p>

        </section>

        {/* 第11条 */}

        <section>

          <h2 className="text-xl mb-3">
            第11条（規約変更）
          </h2>

          <p>
            本規約は、
            必要に応じて変更される場合があります。
          </p>

        </section>

        {/* 第12条 */}

        <section>

          <h2 className="text-xl mb-3">
            第12条（準拠法・管轄）
          </h2>

          <p>
            本規約は日本法に準拠します。
          </p>

          <p className="mt-4">
            本サービスに関する紛争については、
            運営所在地を管轄する裁判所を
            第一審の専属的合意管轄裁判所とします。
          </p>

        </section>

      </div>

    </main>
  )
}