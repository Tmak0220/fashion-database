"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { User, Heart, FileEdit } from "lucide-react"

export default function Header() {
  const router = useRouter()
  const [email, setEmail] = useState<string | null>(null)
  const [search, setSearch] = useState("")

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setEmail(user?.email ?? null)
    }

    getUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email ?? null)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!search.trim()) return
    router.push(`/search?q=${encodeURIComponent(search)}`)
  }

  return (
    <header
      className="
        border-b
        border-border
        px-10
        py-6
        flex
        items-center
        justify-between
        gap-8
        bg-background
      "
    >
      {/* left */}
      <div className="flex items-center gap-8">
        <Link
          href="/"
          className="
            type-brand
            text-2xl
            text-foreground
          "
        >
          FASHION DATABASE
        </Link>

        {/* 検索フォーム */}
        <form
          onSubmit={handleSearch}
          className="
            flex
            items-center
            gap-3
          "
        >
          <input
            type="text"
            placeholder="ブランド名、デザイナー名など"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="
              w-64
              border
              border-border
              rounded-xl
              px-4
              py-2
              text-sm
              bg-background
              text-foreground
            "
          />
          <button
            type="submit"
            className="
              border
              border-border
              rounded-xl
              px-5
              py-2
              text-xs
              tracking-[0.1em]
              font-medium
              bg-surface
              text-foreground
              hover:bg-foreground
              hover:text-background
              transition
            "
          >
           検索
          </button>
        </form>
      </div>

      {/* right */}
      <div
        className="
          flex
          items-center
          gap-8
          text-xs
          text-foreground
        "
      >
        {email ? (
          <>
            <Link 
              href="/mypage" 
              className="flex flex-col items-center gap-1.5 hover:opacity-60 transition"
            >
              <User size={24} strokeWidth={1.5} />
              <span className="font-medium tracking-wider">マイページ</span>
            </Link>

            <Link 
              href="/likes" 
              className="flex flex-col items-center gap-1.5 hover:opacity-60 transition"
            >
              <Heart size={24} strokeWidth={1.5} />
              <span className="font-medium tracking-wider">お気に入り</span>
            </Link>

            <Link 
              href="/bookmarks" 
              className="flex flex-col items-center gap-1.5 hover:opacity-60 transition"
            >
              <FileEdit size={24} strokeWidth={1.5} />
              <span className="font-medium tracking-wider">ブックマーク</span>
            </Link>

            <button
              onClick={handleLogout}
              className="
                ml-2
                border
                border-border
                rounded-xl
                px-4
                py-2
                text-sm
                bg-surface
                text-foreground
                hover:bg-foreground
                hover:text-background
                transition
              "
            >
              ログアウト
            </button>
          </>
        ) : (
          /* 未ログイン時：SIGN IN で究極にミニマルに */
          <div className="flex items-center text-foreground">
            <Link 
              href="/login" 
              className="
                type-ui 
                text-[11px] 
                tracking-[0.14em] 
                hover:opacity-60 
                transition-opacity
              "
            >
              SIGN IN
            </Link>
          </div>
        )}
      </div>
    </header>
  )
}