import Link from "next/link"

export default function NotFound() {
  return (
    <main className="min-h-[70vh] flex flex-col items-center justify-center px-6 py-20 text-center">
      <p className="type-label text-[11px] tracking-[0.14em] text-subtle uppercase">
        404 Error
      </p>

      <h1 className="mt-6 type-brand text-4xl md:text-5xl tracking-[0.08em]">
        Page Not Found
      </h1>

      <p className="mt-6 max-w-md text-sm leading-8 text-muted">
        ページが存在しないか、
        <br />
        削除された可能性があります。
      </p>

      <Link
        href="/"
        className="mt-10 border border-neutral-300 rounded-xl px-6 py-3.5 text-sm tracking-[0.08em] font-semibold uppercase bg-white transition-all duration-300 md:hover:bg-black md:hover:text-white md:hover:border-black active:bg-neutral-100"
      >
        Top Page
      </Link>
    </main>
  )
}