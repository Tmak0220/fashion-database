import "server-only"

import { headers } from "next/headers"
import { SITE_URL } from "@/lib/site"
import type { Locale } from "@/lib/i18n"

export async function getRequestLocale(): Promise<Locale> {
  return (await headers()).get("x-fashdb-locale") === "en" ? "en" : "ja"
}

export async function localizedAlternates(path = "") {
  const locale = await getRequestLocale()
  const normalizedPath = path && path !== "/" ? `/${path.replace(/^\//, "")}` : ""

  return {
    canonical: `${SITE_URL}${locale === "en" ? "/en" : ""}${normalizedPath}`,
    languages: {
      ja: `${SITE_URL}${normalizedPath}`,
      en: `${SITE_URL}/en${normalizedPath}`,
      "x-default": `${SITE_URL}${normalizedPath}`,
    },
  }
}
