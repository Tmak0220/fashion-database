import Link from "next/link"

export default function Footer() {

  return (

    <footer
      className="
        border-t
        border-border
        mt-24
        px-10
        py-10
        md:px-14
        lg:px-16
      "
    >

      <div
        className="
          flex
          flex-wrap
          items-center
          gap-x-8
          gap-y-4
        "
      >

        <Link
          href="/guide"
          className="
            text-xs
            tracking-[0.08em]
            text-muted
            transition-colors
            hover:text-foreground
          "
        >
          使い方
        </Link>

        <Link
          href="/legal"
          className="
            text-xs
            tracking-[0.08em]
            text-muted
            transition-colors
            hover:text-foreground
          "
        >
          特定商取引法
        </Link>

        <Link
          href="/terms"
          className="
            text-xs
            tracking-[0.08em]
            text-muted
            transition-colors
            hover:text-foreground
          "
        >
          利用規約
        </Link>

        <Link
          href="/privacy"
          className="
            text-xs
            tracking-[0.08em]
            text-muted
            transition-colors
            hover:text-foreground
          "
        >
          プライバシーポリシー
        </Link>

        <Link
          href="/contact"
          className="
            text-xs
            tracking-[0.08em]
            text-muted
            transition-colors
            hover:text-foreground
          "
        >
          お問い合わせ
        </Link>

      </div>

    </footer>
  )
}