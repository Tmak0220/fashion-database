import { NextResponse, type NextRequest } from "next/server"
import { checkRateLimit, getClientAddress } from "@/lib/rate-limit"

type GoogleTranslation = {
  translatedText: string
  detectedSourceLanguage?: string
}

type GoogleResponse = {
  data?: { translations?: GoogleTranslation[] }
  error?: { message?: string }
}

const translationCache = new Map<string, GoogleTranslation>()
const MAX_TEXTS = 40
const MAX_CHARACTERS = 12_000

function decodeEntities(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&#x27;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: "Translation is not configured." }, { status: 503 })
  }

  const origin = request.headers.get("origin")
  if (origin && new URL(origin).host !== request.headers.get("host")) {
    return NextResponse.json({ error: "Invalid origin." }, { status: 403 })
  }

  const rateLimit = checkRateLimit(`translate:${getClientAddress(request)}`, 100, 10 * 60 * 1000)
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } }
    )
  }

  const body = (await request.json().catch(() => null)) as { texts?: unknown; target?: unknown } | null
  const texts = Array.isArray(body?.texts)
    ? body.texts.filter((value): value is string => typeof value === "string" && value.trim().length > 0)
    : []
  const target = body?.target === "ja" ? "ja" : "en"

  if (!texts.length || texts.length > MAX_TEXTS || texts.reduce((sum, text) => sum + text.length, 0) > MAX_CHARACTERS) {
    return NextResponse.json({ error: "Invalid translation request." }, { status: 400 })
  }

  const missing = texts.filter((text) => !translationCache.has(`${target}:${text}`))

  if (missing.length) {
    const response = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${encodeURIComponent(apiKey)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ q: missing, target, format: "text" }),
      cache: "no-store",
    })
    const result = (await response.json()) as GoogleResponse

    if (!response.ok || !result.data?.translations) {
      console.error("Translation API error:", result.error?.message ?? response.statusText)
      return NextResponse.json({ error: "Translation failed." }, { status: 502 })
    }

    result.data.translations.forEach((translation, index) => {
      const source = missing[index]
      if (!source) return
      translationCache.set(`${target}:${source}`, {
        ...translation,
        translatedText: decodeEntities(translation.translatedText),
      })
    })

    if (translationCache.size > 1_000) {
      const oldestKey = translationCache.keys().next().value
      if (oldestKey) translationCache.delete(oldestKey)
    }
  }

  return NextResponse.json({
    translations: texts.map((text) => translationCache.get(`${target}:${text}`)),
  })
}
