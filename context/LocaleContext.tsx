"use client"

import { createContext, useCallback, useContext, useEffect, useState } from "react"
import { englishTranslations, type Locale, translateText } from "@/lib/i18n"

type LocaleValue = { locale: Locale; setLocale: (locale: Locale) => void; t: (text: string) => string }
const LocaleContext = createContext<LocaleValue | null>(null)

function localize(root: ParentNode, locale: Locale) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  const nodes: Text[] = []
  while (walker.nextNode()) nodes.push(walker.currentNode as Text)
  nodes.forEach((node) => {
    const original = node.parentElement?.dataset.i18nOriginal ?? node.nodeValue ?? ""
    if (node.parentElement && !node.parentElement.dataset.i18nOriginal && englishTranslations[original.trim()]) {
      node.parentElement.dataset.i18nOriginal = original
    }
    if (englishTranslations[original.trim()]) node.nodeValue = translateText(original, locale)
  })

  root.querySelectorAll?.<HTMLElement>("[placeholder], [aria-label], [title]").forEach((element) => {
    for (const attribute of ["placeholder", "aria-label", "title"] as const) {
      const value = element.getAttribute(attribute)
      if (!value) continue
      const key = `i18n${attribute.replace("-", "")}`
      const original = element.dataset[key] ?? value
      if (englishTranslations[original.trim()]) {
        element.dataset[key] = original
        element.setAttribute(attribute, translateText(original, locale))
      }
    }
  })
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, updateLocale] = useState<Locale>(() => {
    if (typeof window === "undefined") return "ja"
    const saved = localStorage.getItem("fashdb-locale")
    return saved === "en" || saved === "ja" ? saved : navigator.language.startsWith("ja") ? "ja" : "en"
  })

  const setLocale = useCallback((next: Locale) => {
    updateLocale(next)
    localStorage.setItem("fashdb-locale", next)
    document.documentElement.lang = next
    localize(document.body, next)
  }, [])

  useEffect(() => {
    document.documentElement.lang = locale
    localize(document.body, locale)
  }, [locale])

  useEffect(() => {
    const observer = new MutationObserver((changes) => {
      changes.forEach((change) => change.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) localize(node as Element, locale)
      }))
    })
    observer.observe(document.body, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [locale])

  return <LocaleContext.Provider value={{ locale, setLocale, t: (text) => translateText(text, locale) }}>{children}</LocaleContext.Provider>
}

export function useLocale() {
  const value = useContext(LocaleContext)
  if (!value) throw new Error("useLocale must be used inside LocaleProvider")
  return value
}
