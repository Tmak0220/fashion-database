"use client"

import { useLocale } from "@/context/LocaleContext"

type Props = {
  title: string
  titleJa: string
  className?: string
}

export default function SectionHeading({
  title,
  titleJa,
  className = "",
}: Props) {
  const { t } = useLocale()

  return (
    <div className={className}>
      <h2 className="type-display text-[1.65rem] text-foreground">
        {title}
      </h2>
      <p className="mt-1.5 text-sm tracking-[0.04em] text-muted">
        {t(titleJa)}
      </p>
    </div>
  )
}
