"use client"

import Link from "next/link"

type Item = {
  label: string
  href?: string
}

type Props = {
  items: Item[]
}

export default function Breadcrumb({
  items,
}: Props) {

  const jsonLd = {
    "@context": "https://schema.org",

    "@type": "BreadcrumbList",

    itemListElement: items.map(
      (item, index) => ({

        "@type": "ListItem",

        position: index + 1,

        name: item.label,

        item: item.href
          ? `https://fashdb.com${item.href}`
          : undefined,
      })
    ),
  }

  return (
    <>
      {/* JSON-LD */}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd),
        }}
      />

      {/* UI */}

      <nav
        className="
          flex
          flex-wrap
          items-center
          gap-2
          text-sm
          text-subtle
        "
      >

        {items.map((item, index) => {

          const isLast =
            index === items.length - 1

          return (

            <div
              key={index}
              className="flex items-center gap-2"
            >

              {item.href && !isLast ? (

                <Link
                  href={item.href}
                  className="
                    hover:text-black
                    transition
                  "
                >
                  {item.label}
                </Link>

              ) : (

                <span className="text-black">
                  {item.label}
                </span>

              )}

              {!isLast && (

                <span>
                  ＞
                </span>

              )}

            </div>
          )
        })}

      </nav>

    </>
  )
}