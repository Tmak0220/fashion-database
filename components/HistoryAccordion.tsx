"use client"

import { useState } from "react"
import ContentRenderer from "./ContentRenderer"

type HistoryItem = {
  title: string
  content: string
  order: number
  type?: 'text' | 'markdown' | 'html'
}

type Props = {
  items: HistoryItem[]
}

export default function HistoryAccordion({ items }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="space-y-4">
        {items.map((item, i) => (
          <div
            key={i}
            className="border border-border rounded-xl bg-surface overflow-hidden transition-colors"
          >
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="w-full px-6 py-5 flex justify-between items-center group transition-colors hover:bg-foreground/5"
            >
              <span className="type-ui text-sm font-medium tracking-[0.12em] text-foreground">
                {item.title.toUpperCase()}
              </span>
              <span className="text-foreground/40 transition-transform duration-300">
                {openIndex === i ? "—" : "+"}
              </span>
            </button>

            {openIndex === i && (
              <div className="px-6 pb-6 pt-0">
                <ContentRenderer content={item.content} type={item.type || 'text'} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}