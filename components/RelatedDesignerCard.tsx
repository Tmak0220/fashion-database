"use client"

import Link from "next/link"

type RelatedDesigner = {
  id: string
  name: string
  name_ja: string | null
  slug: string
  region_slug: string
  country_slug: string
}

type Props = {
  designer: RelatedDesigner
}

export default function RelatedDesignerCard({ designer }: Props) {
  return (
    <Link
      href={`/designers/${designer.region_slug}/${designer.country_slug}/${designer.slug}`}
      className="group block"
    >
      <div className="w-full aspect-[4/3] border border-border/80 bg-surface rounded-xl flex flex-col items-center justify-center p-4 text-center transition-all duration-300 ease-out md:group-hover:bg-foreground md:group-hover:text-background md:group-hover:border-foreground active:scale-[0.98] active:bg-neutral-100/50">
        <p className="text-xs sm:text-sm md:text-sm font-medium tracking-[0.12em] uppercase truncate w-full text-foreground group-hover:text-background">
          {designer.name}
        </p>
        {designer.name_ja && (
          <p className="text-[10px] sm:text-xs tracking-[0.04em] mt-1.5 text-subtle truncate w-full group-hover:text-background/80">
            {designer.name_ja}
          </p>
        )}
      </div>
    </Link>
  )
}