"use client"

import Link from "@/components/LocalizedLink"
import { useEffect, useState } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { User, Folder, Shield, Menu, Search, X } from "lucide-react"
import { useLocale } from "@/context/LocaleContext"

export default function Header() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [search, setSearch] = useState("")
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
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
    setMenuOpen(false)
    router.refresh()
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!search.trim()) return
    const query = search.trim()
    setSearch("")
    setSearchOpen(false)
    router.push(`${localizePath("/search")}?q=${encodeURIComponent(query)}`)
  }

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false)
        setSearchOpen(false)
      }
    }
    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [])

  const currentQuery = searchParams.toString()
  const returnTo = currentQuery ? `${pathname}?${currentQuery}` : pathname

  const closeMenu = () => setMenuOpen(false)

  const languageToggle = (compact = false) => (
    <div className="flex items-center rounded-full border border-border p-0.5 shrink-0" aria-label="Language">
      {(["ja", "en"] as const).map((value) => (
        <button
          key={value}
          type="button"
          onClick={() => setLocale(value)}
          aria-pressed={locale === value}
          className={`rounded-full ${compact ? "px-2.5 py-1 text-[10px]" : "px-3 py-1.5 text-[11px]"} tracking-wider transition ${locale === value ? "bg-foreground text-background" : "text-muted hover:text-foreground"}`}
        >
          {value === "ja" ? "JA" : "EN"}
        </button>
      ))}
    </div>
  )

  return (
    <>
      <header className="border-b border-border bg-background w-full">
        <div className="flex h-[76px] items-center gap-2 sm:gap-4 px-3 sm:px-5 lg:px-7">
          <button type="button" onClick={() => setMenuOpen(true)} aria-label={t("メニューを開く")} aria-expanded={menuOpen} className="flex size-10 shrink-0 items-center justify-center rounded-xl hover:bg-surface transition-colors">
            <Menu size={23} strokeWidth={1.4} />
          </button>
          <Link href={localizePath("/")} className="type-brand w-[132px] min-[600px]:w-[370px] text-lg min-[600px]:text-xl text-foreground font-medium shrink-0 whitespace-nowrap">
            <span className="min-[600px]:hidden">FASHION DB</span>
            <span className="hidden min-[600px]:inline">FASHION DATABASE</span>
          </Link>
          <form onSubmit={handleSearch} className="hidden md:flex min-w-0 flex-1 items-center gap-2">
            <input type="text" placeholder={t("ブランド名、デザイナー名など")} value={search} onChange={(e) => setSearch(e.target.value)} className="w-full max-w-64 border border-border rounded-xl px-4 py-2 text-sm bg-background text-foreground focus:outline-none focus:border-neutral-400 transition" />
            <button type="submit" className="border border-border rounded-xl px-4 py-2 text-sm bg-surface shrink-0">{t("検索")}</button>
          </form>
          <div className="ml-auto flex items-center gap-1.5 sm:gap-3 shrink-0">
            <button type="button" onClick={() => setSearchOpen(true)} aria-label={t("検索")} className="md:hidden flex size-10 items-center justify-center rounded-xl hover:bg-surface transition-colors">
              <Search size={21} strokeWidth={1.4} />
            </button>
            {languageToggle(true)}
          </div>
        </div>
      </header>

      {menuOpen && (
        <div className="fixed inset-0 z-[70]">
          <button type="button" aria-label={t("メニューを閉じる")} onClick={closeMenu} className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
          <aside className="absolute inset-y-0 left-0 flex w-[min(380px,88vw)] flex-col border-r border-border bg-surface shadow-2xl">
            <div className="flex h-[76px] items-center justify-between border-b border-border px-5">
              <span className="type-brand text-lg">Menu</span>
              <button type="button" onClick={closeMenu} aria-label={t("閉じる")} className="flex size-10 items-center justify-center rounded-xl hover:bg-background"><X size={21} /></button>
            </div>
            <nav className="flex-1 overflow-y-auto px-5 py-7">
              <div className="space-y-1 border-b border-border pb-6">
                {[["Brands", "/brands"], ["Designers", "/designers"], ["Collections", "/collections"], ["Groups", "/groups"], ["Tags", "/tags"]].map(([label, href]) => (
                  <Link key={href} href={localizePath(href)} onClick={closeMenu} className="type-ui flex min-h-11 items-center border-b border-border/30 px-2 text-sm hover:text-muted">{label}</Link>
                ))}
              </div>
              <div className="space-y-1 pt-6">
                {email ? (
                  <>
                    <Link href={localizePath("/mypage")} onClick={closeMenu} className="flex min-h-12 items-center gap-3 px-2 text-sm hover:text-muted"><User size={19} />{t("マイページ")}</Link>
                    <Link href={localizePath("/bookmarks")} onClick={closeMenu} className="flex min-h-12 items-center gap-3 px-2 text-sm hover:text-muted"><Folder size={19} />{t("ブックマーク")}</Link>
                    {isAdmin && <Link href={localizePath("/admin/entities")} onClick={closeMenu} className="flex min-h-12 items-center gap-3 px-2 text-sm hover:text-muted"><Shield size={19} />ADMIN</Link>}
                    <button type="button" onClick={handleLogout} className="mt-4 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm hover:bg-foreground hover:text-background transition-colors">{t("ログアウト")}</button>
                  </>
                ) : (
                  <Link href={`${localizePath("/login")}?redirectTo=${encodeURIComponent(returnTo)}`} onClick={closeMenu} className="block rounded-xl border border-border bg-background px-4 py-3 text-center text-sm">{t("ログイン・新規登録")}</Link>
                )}
              </div>
            </nav>
          </aside>
        </div>
      )}

      {searchOpen && (
        <div className="fixed inset-0 z-[80] flex items-start justify-center bg-black/25 px-4 pt-24 backdrop-blur-sm">
          <button type="button" aria-label={t("検索を閉じる")} onClick={() => setSearchOpen(false)} className="absolute inset-0" />
          <form onSubmit={handleSearch} className="relative flex w-full max-w-xl items-center gap-2 rounded-2xl border border-border bg-surface p-3 shadow-2xl">
            <Search size={20} className="ml-2 shrink-0 text-muted" />
            <input autoFocus type="text" placeholder={t("ブランド名、デザイナー名など")} value={search} onChange={(e) => setSearch(e.target.value)} className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm outline-none" />
            <button type="submit" className="rounded-xl bg-foreground px-4 py-2.5 text-xs text-background">{t("検索")}</button>
            <button type="button" onClick={() => setSearchOpen(false)} aria-label={t("閉じる")} className="flex size-9 items-center justify-center"><X size={18} /></button>
          </form>
        </div>
      )}
    </>
  )
}
