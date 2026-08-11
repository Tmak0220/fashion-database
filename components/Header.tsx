"use client"

import Link from "@/components/LocalizedLink"
import { useEffect, useState } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { User, Folder, Shield } from "lucide-react"
import { useLocale } from "@/context/LocaleContext"

export default function Header() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [search, setSearch] = useState("")
  const { locale, setLocale, localizePath, t } = useLocale()

  useEffect(() => {
    const updateAdminStatus = async (hasUser: boolean) => {
      if (!hasUser) {
        setIsAdmin(false)
        return
      }
      const response = await fetch("/api/admin/status", { cache: "no-store" })
      const data = await response.json().catch(() => ({ isAdmin: false }))
      setIsAdmin(data.isAdmin === true)
    }

    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setEmail(user?.email ?? null)
      await updateAdminStatus(Boolean(user))
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email ?? null)
      void updateAdminStatus(Boolean(session?.user))
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
    const query = search.trim()
    setSearch("")
    router.push(`${localizePath("/search")}?q=${encodeURIComponent(query)}`)
  }

  const currentQuery = searchParams.toString()
  const returnTo = currentQuery ? `${pathname}?${currentQuery}` : pathname

  return (
    <header className="border-b border-border px-4 py-4 md:px-10 md:py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-8 bg-background w-full overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 md:gap-8 w-full md:w-auto">
        <Link href={localizePath("/")} className="type-brand text-xl md:text-2xl text-foreground tracking-wide font-medium text-center sm:text-left block shrink-0">
          FASHION DATABASE
        </Link>

        <form onSubmit={handleSearch} className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="text"
            placeholder={t("ブランド名、デザイナー名など")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-48 md:w-64 border border-border rounded-xl px-4 py-2 text-sm bg-background text-foreground focus:outline-none focus:border-neutral-400 transition min-w-0"
          />
          <button
            type="submit"
            className="border border-border rounded-xl px-4 md:px-5 py-2 text-xs tracking-wider font-medium bg-surface text-foreground hover:bg-black hover:text-white hover:border-black transition shrink-0"
          >
            {t("検索")}
          </button>
        </form>
      </div>

      <div className="flex items-center justify-center md:justify-end gap-6 md:gap-8 text-xs text-foreground pt-2 md:pt-0 border-t border-border/40 md:border-t-0 w-full md:w-auto">
        {email ? (
          <>
            <Link href={localizePath("/mypage")} className="flex flex-col items-center gap-1.5 hover:opacity-60 transition">
              <User size={20} strokeWidth={1.5} />
              <span className="font-medium tracking-wider text-[10px] md:text-xs">{t("マイページ")}</span>
            </Link>

            <Link href={localizePath("/bookmarks")} className="flex flex-col items-center gap-1.5 hover:opacity-60 transition">
              <Folder size={20} strokeWidth={1.5} />
              <span className="font-medium tracking-wider text-[10px] md:text-xs">{t("ブックマーク")}</span>
            </Link>

            {isAdmin && (
              <Link href={localizePath("/admin/entities")} className="flex flex-col items-center gap-1.5 hover:opacity-60 transition">
                <Shield size={20} strokeWidth={1.5} />
                <span className="font-medium tracking-wider text-[10px] md:text-xs">ADMIN</span>
              </Link>
            )}

            <button
              onClick={handleLogout}
              className="ml-2 border border-border rounded-xl px-3.5 py-1.5 text-xs tracking-wider font-medium bg-surface text-foreground hover:bg-black hover:text-white hover:border-black transition"
            >
              {t("ログアウト")}
            </button>
          </>
        ) : (
          <div className="flex items-center text-foreground py-1">
            <Link 
              href={`${localizePath("/login")}?redirectTo=${encodeURIComponent(returnTo)}`}
              className="type-ui text-[11px] tracking-[0.14em] hover:opacity-60 transition-opacity uppercase font-medium"
            >
              SIGN IN
            </Link>
          </div>
        )}
        <div className="flex items-center rounded-full border border-border p-0.5" aria-label="Language">
          {(["ja", "en"] as const).map((value) => (
            <button key={value} type="button" onClick={() => setLocale(value)} aria-pressed={locale === value}
              className={`rounded-full px-2.5 py-1 text-[10px] tracking-wider transition ${locale === value ? "bg-foreground text-background" : "text-muted hover:text-foreground"}`}>
              {value === "ja" ? "日本語" : "EN"}
            </button>
          ))}
        </div>
      </div>
    </header>
  )
}
