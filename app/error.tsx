"use client"

import { useEffect } from "react"

type Props = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: Props) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="min-h-[60vh] flex flex-col items-center justify-center px-6 py-20 text-center">
      <p className="type-label text-[11px] tracking-[0.14em] text-subtle uppercase">
        Error
      </p>

      <h1 className="mt-6 type-brand text-4xl md:text-5xl tracking-[0.08em]">
        Something went wrong
      </h1>

      <p className="mt-6 max-w-md text-sm leading-7 text-muted">
        ページの読み込み中にエラーが発生しました。
        <br />
        時間を置いて再度お試しください。
      </p>

      <button
        onClick={() => reset()}
        className="mt-10 border border-neutral-300 rounded-xl px-6 py-3.5 text-sm tracking-[0.08em] font-semibold uppercase bg-white transition-all duration-300 md:hover:bg-black md:hover:text-white md:hover:border-black active:bg-neutral-100"
      >
        Retry
      </button>
    </main>
  )
}