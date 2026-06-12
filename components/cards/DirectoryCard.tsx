import Link from "next/link"

type Props = {
  href: string
  name: string
  nameJa?: string | null
  uppercase?: boolean
}

export default function DirectoryCard({
  href,
  name,
  nameJa,
  uppercase = false,
}: Props) {
  return (
    <Link
      href={href}
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
      <p className="type-label text-xs font-medium tracking-[0.12em] transition-colors group-hover:text-background">
        {uppercase ? name.toUpperCase() : name}
      </p>

      {nameJa && (
        <p className="type-label-ja mt-1 text-xs text-muted transition-colors group-hover:text-background/80">
          {nameJa}
        </p>
      )}
    </Link>
  )
}