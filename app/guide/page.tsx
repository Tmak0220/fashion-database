import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "使い方",
}

export default function GuidePage() {

  return (

    <main className="max-w-4xl mx-auto px-10 py-20">

      <h1 className="text-4xl">
        使い方
      </h1>

      <div className="mt-10 space-y-12 leading-8 text-[15px]">

        {/* 基本 */}

        <section>

          <h2 className="text-xl mb-3">
            基本
          </h2>

          <p>
            このサイトは、ファッションアイテムのデータを格納・蓄積・保全・整理・構造化することを目的としています。
            ユーザーが増えれば増えるほど、情報の検索・活用が容易になる仕組みです。
          </p>

        </section>

        {/* 閲覧 */}

        <section>

          <h2 className="text-xl mb-3">
            閲覧
          </h2>

          <p>
            メンバーと非メンバーを問わず、ブランドやデザイナーの説明は無制限で読むことができます。
            非メンバーは画像の閲覧が1日50枚までです。
            PLUS MEMBERに登録すると、画像の閲覧が無制限になります。
            また、お気に入り、ブックマーク、ブランドやユーザーのフォロー機能が利用できます。
          </p>

        </section>

        {/* 投稿 */}

        <section>

          <h2 className="text-xl mb-3">
            投稿
          </h2>

          <p>
            PLUS MEMBERに登録すると、画像投稿が利用できます。
          </p>

          <p className="mt-4">
            ファッションアイテムを正面から撮影した画像を1枚登録してください。
            裏地や後ろ見頃などにも特徴があるアイテムの場合は、2枚登録してください。
            タグの画像の登録も推奨します。
          </p>

          <p className="mt-4">
            背景はできる限りシンプルにし、ご自身の持ち物であることを証明できるよう、
            撮影環境に一貫性を持たせることを推奨します。
          </p>

          <p className="mt-4">
            レタッチは許容されますが、過度な加工は生成AI画像との区別が難しくなるため避けてください。
            着用画像の投稿は不可です。
          </p>

          <p className="mt-4">
            登録時には、ブランド、デザイナー、製造年代などを分かる範囲で入力してください。
            年を跨ぐ秋冬シーズン（例：2025-26年秋冬）の入力時は、開始年（2025）を適用してください。
            不明な場合は空欄でも問題ありません。
          </p>

          <p className="mt-4">
            ご自身の所有物であれば、どのようなファッションアイテムでも登録可能ですが、
            大量生産品の登録はできる限り避けていただくことを推奨します。
          </p>

          <p className="mt-4">
            ブランドページやデザイナーページは随時追加予定です。
          </p>

        </section>

        {/* 退会 */}

        <section>

          <h2 className="text-xl mb-3">
            退会
          </h2>

          <p>
            退会時には、アカウント情報を残すか削除するかを選択できます。
            アカウント情報を残した場合、再入会時に再び利用できます。
            削除を選択した場合、登録内容はすべて削除されます。
          </p>

          <p className="mt-4">
            明確なルール違反が確認された場合は、強制退会となる場合があります。
          </p>

          <div className="mt-4 space-y-2">

            <p>例：</p>

            <ul className="list-disc pl-6 space-y-1">

              <li>
                明らかに無関係な画像やブランド、デザイナー登録を繰り返す行為
              </li>

              <li>
                生成AIで作成した画像を登録する行為
              </li>

              <li>
                他者の画像を無断転載する行為
              </li>

              <li>
                公序良俗に反する内容を登録する行為
              </li>

              <li>
                その他、運営が不適切と判断する行為
              </li>

            </ul>

          </div>

        </section>

      </div>

    </main>
  )
}