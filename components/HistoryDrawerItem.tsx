"use client"

import { useState } from "react"
import Drawer from "./Drawer"
import AutoTranslatedText from "@/components/AutoTranslatedText"

type Props = {
  title: string
  content: string
}

export default function HistoryDrawerItem({ title, content }: Props) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="
          group
          w-full
          min-h-[130px]
          flex
          flex-col
          items-center
          justify-center
          px-8
          py-7
          bg-surface
          border
          border-border
          rounded-xl
          transition-all
          duration-300
          hover:border-foreground/20
          hover:-translate-y-[1px]
        "
      >
        <span
          className="
            text-sm
            md:text-[15px]
            font-medium
            tracking-[0.02em]
            text-foreground
            text-center
            leading-relaxed
          "
        >
          <AutoTranslatedText text={title} showControls={false} />
        </span>
  
        <div
          className="
            w-8
            h-px
            mt-5
            bg-border
            transition-colors
            duration-300
            group-hover:bg-foreground/30
          "
        />
      </button>
  
      <Drawer
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="HISTORY"
        subtitle={<AutoTranslatedText text={title} showControls={false} />}
      >
        <AutoTranslatedText text={content} as="span" showControls />
      </Drawer>
    </>
  )
}
