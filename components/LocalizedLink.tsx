"use client"

import NextLink from "next/link"
import type { ComponentProps } from "react"
import { useLocale } from "@/context/LocaleContext"

type Props = ComponentProps<typeof NextLink>

export default function LocalizedLink({ href, ...props }: Props) {
  const { localizePath } = useLocale()
  const localizedHref = typeof href === "string" ? localizePath(href) : href

  return <NextLink href={localizedHref} {...props} />
}
