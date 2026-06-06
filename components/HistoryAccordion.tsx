"use client"

import { useState } from "react"

type Props = {
  items: {
    title: string
    content: string
    order: number
  }[]
}

export default function HistoryAccordion({ items }: Props) {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="space-y-4">
        {items.map((item, i) => (
          <div
            key={i}
            className="border rounded-xl bg-white shadow-sm overflow-hidden"
          >
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full px-5 py-4 flex justify-between items-center hover:bg-gray-50 transition"
            >
              <span className="font-medium">{item.title}</span>
              <span className="text-gray-400">
                {open === i ? "−" : "+"}
              </span>
            </button>

            {/* 👇ここがポイント */}
            {open === i && (
              <div className="px-5 py-4">
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                  {item.content}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}