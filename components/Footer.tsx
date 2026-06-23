import Link from "next/link"

const FOOTER_LINKS = [
  { href: "/guide", label: "使い方" },
  { href: "/legal", label: "特定商取引法" },
  { href: "/terms", label: "利用規約" },
  { href: "/privacy", label: "プライバシーポリシー" },
  { href: "/contact", label: "お問い合わせ" },
]

export default function Footer() {
  return (
    <footer className="border-t border-border mt-24 px-4 py-8 md:px-10 md:py-10">
      <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-8 gap-y-4">
        {FOOTER_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-xs tracking-[0.08em] text-muted transition-colors hover:text-foreground whitespace-nowrap"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </footer>
  )
}