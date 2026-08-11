"use client"

import { useEffect, useRef, useState } from "react"
import ReactMarkdown from "react-markdown"

type DrawerProps = {
  isOpen: boolean
  onClose: () => void
  title: string
  subtitle?: React.ReactNode
  children: React.ReactNode
}

export default function Drawer({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
}: DrawerProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const [readingProgress, setReadingProgress] = useState(0)

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    let animationFrame: number | undefined
    if (isOpen) {
      document.body.style.overflow = "hidden"
      scrollAreaRef.current?.scrollTo({ top: 0 })
      animationFrame = window.requestAnimationFrame(() => {
        setReadingProgress(0)
        closeButtonRef.current?.focus()
      })
    }

    return () => {
      if (animationFrame !== undefined) window.cancelAnimationFrame(animationFrame)
      document.body.style.overflow = previousOverflow
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

  const updateReadingProgress = () => {
    const element = scrollAreaRef.current
    if (!element) return
    const scrollableDistance = element.scrollHeight - element.clientHeight
    setReadingProgress(scrollableDistance > 0
      ? Math.min(100, (element.scrollTop / scrollableDistance) * 100)
      : 100)
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
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
        className={`absolute right-0 top-0 bottom-0 w-full sm:w-[70vw] lg:w-[60vw] xl:w-[min(900px,58vw)] bg-surface shadow-2xl border-l border-border/60 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <header className="shrink-0 bg-surface border-b border-border/30">
          <div className="flex items-center justify-between px-5 py-4 md:px-8 md:py-5">
            <div className="flex items-center gap-3">
              <span className="text-[10px] uppercase tracking-[0.18em] text-subtle font-medium">
                {title}
              </span>
              <span className="hidden sm:inline text-[9px] tabular-nums tracking-wider text-subtle" aria-live="polite">
                {Math.round(readingProgress)}%
              </span>
            </div>

            <button
              ref={closeButtonRef}
              onClick={onClose}
              className="p-2 -mr-2 text-muted hover:text-foreground focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 transition-all duration-300 hover:rotate-45"
              aria-label="閉じる"
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
          <div className="h-px bg-border/40 overflow-hidden" aria-hidden="true">
            <div
              className="h-full bg-foreground/70 transition-[width] duration-150"
              style={{ width: `${readingProgress}%` }}
            />
          </div>
        </header>

        <div
          ref={scrollAreaRef}
          onScroll={updateReadingProgress}
          className="flex-1 overflow-y-auto px-6 py-9 sm:px-10 md:px-14 md:py-14 lg:px-16 custom-scrollbar overscroll-contain"
        >
          <article className="max-w-[720px] mx-auto w-full pb-20">
            {subtitle && (
              <h2 className="type-display text-2xl md:text-3xl font-light leading-snug mb-10 md:mb-14 text-foreground">
                {subtitle}
              </h2>
            )}

            <div className="text-[15px] md:text-base leading-[2.05] tracking-[0.015em] text-foreground/85 prose prose-neutral max-w-none prose-headings:font-normal prose-headings:tracking-wide prose-headings:text-foreground prose-h1:mt-14 prose-h1:mb-6 prose-h1:text-3xl prose-h2:mt-12 prose-h2:mb-5 prose-h2:border-b prose-h2:border-border/50 prose-h2:pb-3 prose-h2:text-2xl prose-h3:mt-9 prose-h3:mb-4 prose-h3:text-xl prose-p:my-6 prose-p:leading-[2.05] prose-li:my-2 prose-li:leading-[1.9] prose-a:text-foreground prose-a:underline prose-strong:text-foreground prose-blockquote:border-foreground/30 prose-blockquote:text-muted">
              {typeof children === "string" ? <ReactMarkdown>{children}</ReactMarkdown> : children}
            </div>
          </article>
        </div>
      </div>
    </div>
  )
}
