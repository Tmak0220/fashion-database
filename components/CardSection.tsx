import SectionHeading from "@/components/SectionHeading"
import NavigationCard from "@/components/cards/NavigationCard"
import DirectoryCard from "@/components/cards/DirectoryCard"

type CardItem = {
  id: string | number
  name: string
  name_ja?: string | null
  slug: string
}

type Props = {
  title?: string
  titleJa?: string
  items: CardItem[] | null
  basePath: string
  uppercase?: boolean
  variant?: "directory" | "navigation"
  showHeading?: boolean
}

export default function CardSection({
  title,
  titleJa,
  items,
  basePath,
  uppercase = false,
  variant = "directory",
  showHeading = true,
}: Props) {
  if (!items || items.length === 0) return null

  const isNavigation = variant === "navigation"

  return (
    <section className={showHeading ? "mt-12 sm:mt-16" : "mt-12 sm:mt-14"}>
      {showHeading && title && titleJa && (
        <SectionHeading
          title={title}
          titleJa={titleJa}
          className="mb-6"
        />
      )}

      <div
        className={
          isNavigation
            ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4"
            : "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 max-w-7xl"
        }
      >
        {items.map((item) => {
          const href = basePath
            ? `${basePath}/${item.slug}`
            : `/${item.slug}`

          return isNavigation ? (
            <NavigationCard
              key={item.id}
              href={href}
              name={item.name}
              nameJa={item.name_ja}
            />
          ) : (
            <DirectoryCard
              key={item.id}
              href={href}
              name={item.name}
              nameJa={item.name_ja}
              uppercase={uppercase}
            />
          )
        })}
      </div>
    </section>
  )
}