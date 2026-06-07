import Link from "next/link"
import React from "react"

type Props = {
  title: string
  subtitle?: string
  children: React.ReactNode
}

export default function PageLayout({
  title,
  subtitle,
  children,
}: Props) {
  return (
    <main className="p-6 sm:p-10 md:p-14 lg:p-16">
      <nav className="flex flex-wrap items-center gap-2 text-sm text-subtle">
        <Link
          href="/"
          className="hover:text-black transition-colors duration-300"
        >
          ファッションデータベース
        </Link>
        <span>＞</span>
        <span className="text-black">
          {subtitle ?? title}
        </span>
      </nav>

      <header className="mt-8 mb-12 sm:mb-16">
        <h1 className="type-brand text-4xl sm:text-5xl md:text-6xl tracking-[0.18em] pr-[0.18em]">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-3 text-lg sm:text-xl tracking-[0.04em] text-muted">
            {subtitle}
          </p>
        )}
      </header>

      {children}
    </main>
  )
}