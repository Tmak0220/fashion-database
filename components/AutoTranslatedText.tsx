"use client"

import { useEffect, useState } from "react"
import { useLocale } from "@/context/LocaleContext"

type Translation = { translatedText: string; detectedSourceLanguage?: string }
type PendingItem = { text: string; target: "ja" | "en"; resolve: (translation: Translation | null) => void }

const memoryCache = new Map<string, Translation>()
let pending: PendingItem[] = []
let timer: ReturnType<typeof setTimeout> | null = null

async function flushTranslations() {
  const target = pending[0]?.target
  const batch = pending.filter((item) => item.target === target).slice(0, 40)
  pending = pending.filter((item) => !batch.includes(item))
  timer = null
  if (!batch.length) return

  try {
    const response = await fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texts: batch.map((item) => item.text), target }),
    })
    if (!response.ok) throw new Error("Translation unavailable")
    const data = (await response.json()) as { translations?: Array<Translation | null> }
    batch.forEach((item, index) => {
      const translation = data.translations?.[index] ?? null
      if (translation) memoryCache.set(`${target}:${item.text}`, translation)
      item.resolve(translation)
    })
  } catch {
    batch.forEach((item) => item.resolve(null))
  }

  if (pending.length) timer = setTimeout(flushTranslations, 20)
}

function requestTranslation(text: string, target: "ja" | "en") {
  const cached = memoryCache.get(`${target}:${text}`)
  if (cached) return Promise.resolve(cached)

  return new Promise<Translation | null>((resolve) => {
    pending.push({ text, target, resolve })
    if (!timer) timer = setTimeout(flushTranslations, 20)
  })
}

type Props = {
  text: string | null | undefined
  as?: "p" | "span" | "h1" | "h2"
  className?: string
  showControls?: boolean
}

export default function AutoTranslatedText({ text, as: Tag = "span", className, showControls = true }: Props) {
  const { locale } = useLocale()
  const [translation, setTranslation] = useState<(Translation & { sourceText: string; target: "ja" | "en" }) | null>(null)
  const [showOriginal, setShowOriginal] = useState(false)

  useEffect(() => {
    let active = true
    if (!text?.trim()) return

    const containsJapanese = /[\u3040-\u30ff\u3400-\u9fff]/.test(text)
    const shouldTranslate = locale === "en" ? containsJapanese : !containsJapanese
    if (!shouldTranslate) return

    requestTranslation(text, locale).then((result) => {
      if (active && result) setTranslation({ ...result, sourceText: text, target: locale })
    })
    return () => { active = false }
  }, [locale, text])

  if (!text) return null
  const wasTranslated = translation
    && translation.sourceText === text
    && translation.target === locale
    && translation.detectedSourceLanguage !== locale
  const displayedText = wasTranslated && !showOriginal ? translation.translatedText : text

  return (
    <>
      <Tag className={className}>{displayedText}</Tag>
      {wasTranslated && showControls && (
        <button
          type="button"
          onClick={() => setShowOriginal((value) => !value)}
          className="mt-1 block text-[10px] tracking-wide text-subtle hover:text-foreground transition"
        >
          {locale === "ja"
            ? showOriginal ? "自動翻訳を表示" : "自動翻訳 · 原文を表示"
            : showOriginal ? "Show machine translation" : "Machine translated · Show original"}
        </button>
      )}
    </>
  )
}
