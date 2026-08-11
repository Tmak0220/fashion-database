"use client"

import Link from "@/components/LocalizedLink"
import { useLocale } from "@/context/LocaleContext"

type Props = {
  href: string
  name: string
  nameJa?: string | null
  index?: number
}

export default function NavigationCard({
  href,
  name,
  nameJa,
  index,
}: Props) {
  const { localizePath, t } = useLocale()
  return (
    <Link
      href={localizePath(href)}
      className="
        group
        relative
        flex
        flex-col
        items-center
        justify-center
        text-center
        min-h-28
        bg-surface/90
        px-5
        py-6
        transition-all
        duration-300
        hover:bg-foreground
        focus-visible:bg-foreground
      "
    >
      {index !== undefined && (
        <span className="type-ui absolute left-4 top-3 text-[9px] tabular-nums tracking-[0.16em] text-foreground/30 transition-colors group-hover:text-background/55 group-focus-visible:text-background/55">
          {String(index + 1).padStart(2, "0")}
        </span>
      )}
      <p className="type-label text-sm font-medium !text-foreground/75 transition-colors group-hover:!text-background group-focus-visible:!text-background">
        {name}
      </p>

      {nameJa && (
        <p className="type-label-ja mt-1.5 text-xs !text-foreground/55 transition-colors group-hover:!text-background/75 group-focus-visible:!text-background/75">
          {t(nameJa)}
        </p>
      )}
    </Link>
  )
}
