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
}

export default function CardSection({
  title,
  titleJa,
  items,
  basePath,
}: Props) {
  return (
    <section className="mt-12 sm:mt-16">
      <SectionHeading
        title={title}
        titleJa={titleJa}
        className="mb-6"
      />

      <div className="flex flex-wrap gap-3 sm:gap-4">
        {items?.map((item) => (
          <Link
            key={item.id}
            href={`${basePath}/${item.slug}`}
            className="
              group
              flex
              flex-col
              items-center
              border
              border-neutral-300
              rounded-xl
              px-5
              sm:px-6
              py-3.5
              sm:py-4
              bg-white
              transition-all
              duration-300
              md:hover:bg-black
              md:hover:text-white
              md:hover:border-black
              active:bg-neutral-100
            "
          >
            <p
              className="
                type-label
                text-sm
                tracking-[0.08em]
                font-semibold
                uppercase
                text-center
                group-hover:text-inherit
              "
            >
              {item.name}
            </p>

            {item.name_ja && (
              <p
                className="
                  type-label-ja
                  mt-1
                  text-xs
                  text-center
                  text-muted
                  group-hover:text-inherit
                  opacity-80
                "
              >
                {item.name_ja}
              </p>
            )}
          </Link>
        ))}
      </div>
    </section>
  )
}