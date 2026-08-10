"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { useLocale } from "@/context/LocaleContext"

export function AuthListener() {
  const router = useRouter()
  const pathname = usePathname()
  const { localizePath } = useLocale()

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        const protectedRoutes = ["/mypage", "/likes", "/bookmarks", "/users", "/edit-post"]
        const pathWithoutLocale = pathname.replace(/^\/en(?=\/|$)/, "") || "/"
        const isProtectedRoute = protectedRoutes.some(route => pathWithoutLocale.startsWith(route))

        if (isProtectedRoute) {
          router.push(localizePath("/"))
          router.refresh()
        } else {
          router.refresh()
        }
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [localizePath, pathname, router])

  return null
}
