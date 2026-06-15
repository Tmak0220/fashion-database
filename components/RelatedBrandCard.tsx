"use client"

import Link from "next/link"

type RelatedBrand = {
  id: string
  name: string
  name_ja: string | null
  slug: string
  image_url: string | null
  region_slug: string
  country_slug: string
}

type Props = {
  brand: RelatedBrand
}

export default function RelatedBrandCard({ brand }: Props) {
  return (
    <Link
      href={`/brands/${brand.region_slug}/${brand.country_slug}/${brand.slug}`}
      className="group block"
    >
      <div className="w-full aspect-[4/3] border border-border bg-surface rounded-xl flex flex-col items-center justify-center p-3 sm:p-4 text-center transition-all duration-300 md:group-hover:bg-black md:group-hover:text-white md:group-hover:border-black active:bg-neutral-100">
        <p className="text-xs sm:text-sm md:text-base font-semibold tracking-[0.06em] uppercase truncate w-full text-foreground group-hover:text-inherit">
          {brand.name}
        </p>
        {brand.name_ja && (
          <p className="text-[10px] sm:text-xs tracking-[0.02em] mt-1 sm:mt-1.5 text-muted group-hover:text-inherit opacity-80 truncate w-full">
            {brand.name_ja}
          </p>
        )}
      </div>
    </Link>
  )
}