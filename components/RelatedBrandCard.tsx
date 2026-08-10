"use client"

import Link from "@/components/LocalizedLink"

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
      <div className="w-full aspect-[4/3] border border-border/80 bg-surface rounded-xl flex flex-col items-center justify-center p-4 text-center transition-all duration-300 ease-out md:group-hover:bg-foreground md:group-hover:text-background md:group-hover:border-foreground active:scale-[0.98] active:bg-neutral-100/50">
        <p className="text-xs sm:text-sm md:text-sm font-medium tracking-[0.12em] uppercase truncate w-full text-foreground group-hover:text-background">
          {brand.name}
        </p>
        {brand.name_ja && (
          <p className="text-[10px] sm:text-xs tracking-[0.04em] mt-1.5 text-subtle truncate w-full group-hover:text-background/80">
            {brand.name_ja}
          </p>
        )}
      </div>
    </Link>
  )
}