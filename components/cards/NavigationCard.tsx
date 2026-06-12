import Link from "next/link"

type Props = {
  href: string
  name: string
  nameJa?: string | null
}

export default function NavigationCard({
  href,
  name,
  nameJa,
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
        bg-surface
        px-5
        py-5
        transition-all
        duration-300
        hover:border-foreground/30
        hover:bg-foreground/[0.02]
        hover:-translate-y-[2px]
      "
    >
      <p className="type-label text-sm font-medium text-foreground">
        {name}
      </p>

      {nameJa && (
        <p className="type-label-ja mt-1 text-xs text-muted">
          {nameJa}
        </p>
      )}
    </Link>
  )
}