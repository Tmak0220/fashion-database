"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { User, Folder } from "lucide-react"

export default function Header() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState<string | null>(null)
  const [search, setSearch] = useState("")

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setEmail(user?.email ?? null)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email ?? null)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.refresh()
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!search.trim()) return
    router.push(`/search?q=${encodeURIComponent(search)}`)
  }

  const currentQuery = searchParams.toString()
  const returnTo = currentQuery ? `${pathname}?${currentQuery}` : pathname

  return (
    <header className="border-b border-border px-4 py-4 md:px-10 md:py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-8 bg-background w-full overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 md:gap-8 w-full md:w-auto">
        <Link href="/" className="type-brand text-xl md:text-2xl text-foreground tracking-wide font-medium text-center sm:text-left block shrink-0">
          FASHION DATABASE
        </Link>

        <form onSubmit={handleSearch} className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="text"
            placeholder="ブランド名、デザイナー名など"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-48 md:w-64 border border-border rounded-xl px-4 py-2 text-sm bg-background text-foreground focus:outline-none focus:border-neutral-400 transition min-w-0"
          />
          <button
            type="submit"
            className="border border-border rounded-xl px-4 md:px-5 py-2 text-xs tracking-wider font-medium bg-surface text-foreground hover:bg-black hover:text-white hover:border-black transition shrink-0"
          >
            検索
          </button>
        </form>
      </div>

      <div className="flex items-center justify-center md:justify-end gap-6 md:gap-8 text-xs text-foreground pt-2 md:pt-0 border-t border-border/40 md:border-t-0 w-full md:w-auto">
        {email ? (
          <>
            <Link href="/mypage" className="flex flex-col items-center gap-1.5 hover:opacity-60 transition">
              <User size={20} strokeWidth={1.5} />
              <span className="font-medium tracking-wider text-[10px] md:text-xs">マイページ</span>
            </Link>

            <Link href="/bookmarks" className="flex flex-col items-center gap-1.5 hover:opacity-60 transition">
              <Folder size={20} strokeWidth={1.5} />
              <span className="font-medium tracking-wider text-[10px] md:text-xs">ブックマーク</span>
            </Link>

            <button
              onClick={handleLogout}
              className="ml-2 border border-border rounded-xl px-3.5 py-1.5 text-xs tracking-wider font-medium bg-surface text-foreground hover:bg-black hover:text-white hover:border-black transition"
            >
              ログアウト
            </button>
          </>
        ) : (
          <div className="flex items-center text-foreground py-1">
            <Link 
              href={`/login?redirectTo=${encodeURIComponent(returnTo)}`} 
              className="type-ui text-[11px] tracking-[0.14em] hover:opacity-60 transition-opacity uppercase font-medium"
            >
              SIGN IN
            </Link>
          </div>
        )}
      </div>
    </header>
  )
}