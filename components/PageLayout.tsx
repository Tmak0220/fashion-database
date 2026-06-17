import Link from "next/link"
import React from "react"

type BreadcrumbItem = {
  label: string
  href?: string
}

type Props = {
  title: string
  subtitle?: string
  breadcrumbs?: BreadcrumbItem[]
  children: React.ReactNode
}

export default function PageLayout({
  title,
  subtitle,
  breadcrumbs,
  children,
}: Props) {
  // breadcrumbs が空の配列 [] として明示的に渡された場合は、パンくず自体を非表示（null）にする
  const shouldRenderBreadcrumbs = breadcrumbs === undefined || breadcrumbs.length > 0

  return (
    <main className="p-6 sm:p-10 md:p-14 lg:p-16">
      {shouldRenderBreadcrumbs && (
        <nav className="flex flex-wrap items-center gap-2 text-sm text-subtle">
          {breadcrumbs ? (
            breadcrumbs.map((item, index) => (
              <React.Fragment key={index}>
                {index > 0 && <span>＞</span>}
                {item.href ? (
                  <Link
                    href={item.href}
                    className="hover:text-black transition-colors duration-300"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span className="text-black">{item.label}</span>
                )}
              </React.Fragment>
            ))
          ) : (
            <>
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
            </>
          )}
        </nav>
      )}

      <header className={shouldRenderBreadcrumbs ? "mt-8 mb-12 sm:mb-16" : "mb-12 sm:mb-16"}>
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