"use client"

import { useState } from "react"

type Props = {
  description: string | null
  centered?: boolean
}

export default function CollapsibleDescription({
  description,
  centered = false,
}: Props) {
  const [open, setOpen] = useState(false)

  if (!description) return null

  return (
    <div className={centered ? "text-center" : ""}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        className="mt-3 text-xs tracking-[0.06em] text-muted transition-colors hover:text-foreground"
      >
        {open ? "説明を閉じる" : "説明を表示"}
      </button>

      {open && (
        <p
          className={`mt-4 text-sm leading-[1.9] text-muted whitespace-pre-line ${
            centered ? "mx-auto max-w-2xl text-left" 
                     : "max-w-2xl"
          }`}
        >
          {description}
        </p>
      )}
    </div>
  )
}
