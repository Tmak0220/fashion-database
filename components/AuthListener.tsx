"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { supabase } from "@/lib/supabase"

export function AuthListener() {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        const protectedRoutes = ["/mypage", "/likes", "/bookmarks", "/users", "/edit-post"]
        const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

        if (isProtectedRoute) {
          router.push("/")
          router.refresh()
        } else {
          router.refresh()
        }
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [pathname, router])

  return null
}