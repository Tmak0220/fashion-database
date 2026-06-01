"use client"

import Link from "next/link"

type Designer = {
  id: number
  slug: string
  name: string
  region_slug: string
  country_slug: string
}

export default function DesignerButton({
  designer,
}: {
  designer: Designer
}) {
  return (
    <Link
      href={`/designers/${designer.region_slug}/${designer.country_slug}/${designer.slug}`}
      className="
        inline-block
        border
        border-border
        rounded-xl
        px-6
        py-4
        bg-surface
        text-foreground
        hover:bg-foreground
        hover:text-background
        transition-colors
        duration-300
      "
    >
      <span
        className="type-ui text-xs font-medium tracking-[0.12em]"
        style={{
          paddingRight: "0.12em"
        }}
      >
        {designer.name.toUpperCase()}
      </span>
    </Link>
  )
}