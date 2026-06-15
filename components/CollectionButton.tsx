import Link from "next/link"

type Props = {
  collection: {
    id: number
    year: number | string
    season: string
    label?: string | null
  }
}

export default function CollectionButton({ collection }: Props) {
  return (
    <Link
      href={`/collections/${collection.id}`}
      className="flex items-center justify-center w-full type-ui border border-border/80 bg-surface rounded-xl h-11 text-xs font-medium tracking-[0.02em] text-foreground transition-all duration-300 hover:bg-foreground hover:text-background active:scale-[0.98]"
    >
      {collection.label || `${collection.year} ${collection.season}`}
    </Link>
  )
}