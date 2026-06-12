"use client"

import { useState } from "react"
import Drawer from "./Drawer"

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
        className="w-full flex items-center justify-between p-6 border border-border rounded-xl hover:bg-surface transition-colors"
      >
        <span className="text-sm font-medium text-foreground">{title}</span>
        <span className="text-[10px] uppercase text-muted tracking-widest underline">詳細を読む</span>
      </button>

      <Drawer
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="歴史と背景"
        subtitle={title}
      >
        {content}
      </Drawer>
    </>
  )
}