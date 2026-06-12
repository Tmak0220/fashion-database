"use client"

import { useEffect } from "react"
import ReactMarkdown from "react-markdown"

type DrawerProps = {
  isOpen: boolean
  onClose: () => void
  title: string
  subtitle?: string
  children: React.ReactNode
}

export default function Drawer({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
}: DrawerProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }

    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [onClose])

  return (
    <div
      className={`fixed inset-0 z-50 transition-all duration-500 ${
        isOpen ? "opacity-100 visible" : "opacity-0 invisible"
      }`}
    >
      <div
        className={`absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity duration-500 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      <div
        className={`absolute right-0 top-0 bottom-0 w-full sm:w-[440px] md:w-[500px] bg-surface shadow-2xl border-l border-border/60 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-border/30">
          <span className="text-[10px] uppercase tracking-[0.18em] text-subtle font-medium">
            {title}
          </span>

          <button
            onClick={onClose}
            className="p-2 -mr-2 text-muted hover:text-foreground transition-all duration-300 hover:rotate-45"
            aria-label="Close"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-7 md:px-10 md:py-12 custom-scrollbar">
          <div className="max-w-[620px] mx-auto w-full">
            {subtitle && (
              <h2 className="text-xl md:text-2xl font-light leading-snug mb-8 text-foreground">
                {subtitle}
              </h2>
            )}

            <div className="text-[14px] md:text-sm leading-[2] tracking-[0.02em] text-foreground/80 prose prose-sm max-w-none">
              <ReactMarkdown>
                {children as string}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}