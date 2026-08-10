"use client"

import { createContext, useCallback, useContext, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { type Locale, translateText } from "@/lib/i18n"

type LocaleValue = {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (text: string) => string
  localizePath: (path: string) => string
}
const LocaleContext = createContext<LocaleValue | null>(null)

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const pathLocale: Locale = pathname === "/en" || pathname.startsWith("/en/") ? "en" : "ja"
  const locale = pathLocale

  const localizePath = useCallback((path: string) => {
    if (!path.startsWith("/") || path.startsWith("/api/")) return path
    const withoutLocale = path.replace(/^\/(ja|en)(?=\/|$)/, "") || "/"
    return locale === "en" ? `/en${withoutLocale === "/" ? "" : withoutLocale}` : withoutLocale
  }, [locale])

  const setLocale = useCallback((next: Locale) => {
    const withoutLocale = pathname.replace(/^\/(ja|en)(?=\/|$)/, "") || "/"
    const query = window.location.search
    router.push(`${next === "en" ? "/en" : ""}${withoutLocale === "/" ? "/" : withoutLocale}${query}`)
  }, [pathname, router])

  useEffect(() => {
    document.documentElement.lang = pathLocale
  }, [pathLocale])

  return <LocaleContext.Provider value={{ locale, setLocale, localizePath, t: (text) => translateText(text, locale) }}>{children}</LocaleContext.Provider>
}

export function useLocale() {
  const value = useContext(LocaleContext)
  if (!value) throw new Error("useLocale must be used inside LocaleProvider")
  return value
}
