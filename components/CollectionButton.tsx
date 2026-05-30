import Link from "next/link"

type Props = {
  collection: {
    id: number
    year: number | string
    season: string
    label?: string | null
  }
}

export default function CollectionButton({
  collection,
}: Props) {

  return (
    <Link
      href={`/collections/${collection.id}`}
      className="
        type-ui
        border
        border-border
        bg-surface
        px-5
        py-2.5
        text-xs
        text-foreground
        transition-colors
        duration-300
        hover:border-foreground
        hover:bg-foreground
        hover:text-background
      "
    >

      {collection.label || `${collection.year} ${collection.season}`}

    </Link>
  )
}