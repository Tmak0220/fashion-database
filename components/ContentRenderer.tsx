"use client"

import { useEffect, useState } from "react"
import ReactMarkdown from 'react-markdown';
import { useLocale } from "@/context/LocaleContext"

type ContentType = 'text' | 'markdown' | 'html';

type Props = {
  content: string;
  type?: ContentType;
};

export default function ContentRenderer({ content, type = 'text' }: Props) {
  const { locale } = useLocale()
  const [translation, setTranslation] = useState<{ source: string; target: "ja" | "en"; text: string } | null>(null)
  const baseClasses = "prose prose-neutral max-w-none text-sm leading-relaxed text-muted";
  const shouldTranslate = type !== "html" && (locale === "en"
    ? /[\u3040-\u30ff\u3400-\u9fff]/.test(content)
    : !/[\u3040-\u30ff\u3400-\u9fff]/.test(content))

  useEffect(() => {
    let active = true
    if (!shouldTranslate || !content.trim()) return

    fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texts: [content], target: locale }),
    })
      .then((response) => response.ok ? response.json() : null)
      .then((data) => {
        const translated = data?.translations?.[0]?.translatedText
        if (active && typeof translated === "string") setTranslation({ source: content, target: locale, text: translated })
      })
      .catch(() => undefined)

    return () => { active = false }
  }, [content, locale, shouldTranslate])

  const displayedContent = translation?.source === content && translation.target === locale ? translation.text : content

  switch (type) {
    case 'markdown':
      return (
        <div className={baseClasses}>
          <ReactMarkdown>{displayedContent}</ReactMarkdown>
        </div>
      );

    case 'html':
      return (
        <div 
          className={`${baseClasses} prose-table:border-collapse prose-table:border prose-th:border prose-td:border prose-th:p-2 prose-td:p-2`}
          dangerouslySetInnerHTML={{ __html: content }} 
        />
      );

    case 'text':
    default:
      return (
        <p className="text-sm leading-relaxed text-muted whitespace-pre-line">
          {displayedContent}
        </p>
      );
  }
}
