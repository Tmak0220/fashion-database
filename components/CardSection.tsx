import Link from "next/link"
import SectionHeading from "@/components/SectionHeading"

type CardItem = {
  id: string | number
  name: string
  name_ja?: string | null
  slug: string
}

type Props = {
  title: string
  titleJa: string
  items: CardItem[] | null
  basePath: string
  uppercase?: boolean
}

export default function CardSection({
  title,
  titleJa,
  items,
  basePath,
  uppercase = false,
}: Props) {
  if (!items || items.length === 0) return null

  return (
    <section className="mt-12 sm:mt-16">
      <SectionHeading title={title} titleJa={titleJa} className="mb-6" />

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 max-w-7xl">
        {items.map((item) => (
          <Link
            key={item.id}
            href={`${basePath}/${item.slug}`}
            className="
              group
              flex
              flex-col
              items-center
              justify-center
              text-center
              border
              border-border
              rounded-xl
              px-4
              py-5
              bg-surface
              transition-all
              duration-300
              hover:bg-foreground
              hover:border-foreground
              active:scale-[0.98]
            "
          >
            <p className="type-label group-hover:text-background transition-colors text-xs font-medium tracking-[0.12em]">
              {uppercase ? item.name.toUpperCase() : item.name}
            </p>

            {item.name_ja && (
              <p className="type-label-ja mt-1 text-xs text-muted group-hover:text-background/80 transition-colors">
                {item.name_ja}
              </p>
            )}
          </Link>
        ))}
      </div>
    </section>
  )
}