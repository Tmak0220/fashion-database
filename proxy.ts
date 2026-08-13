import { NextResponse, type NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"

type Locale = "ja" | "en"

export async function proxy(request: NextRequest) {
  if (request.headers.get("x-fashdb-internal-rewrite") === "1") {
    return NextResponse.next()
  }

  const { pathname } = request.nextUrl
  if (pathname === "/ja" || pathname.startsWith("/ja/")) {
    const url = request.nextUrl.clone()
    url.pathname = pathname.slice(3) || "/"
    return NextResponse.redirect(url, 308)
  }

  const locale: Locale = pathname === "/en" || pathname.startsWith("/en/") ? "en" : "ja"
  const url = request.nextUrl.clone()
  if (locale === "en") url.pathname = pathname.slice(3) || "/"

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set("x-fashdb-locale", locale)
  requestHeaders.set("x-fashdb-internal-rewrite", "1")

  let response = NextResponse.rewrite(url, { request: { headers: requestHeaders } })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.rewrite(url, { request: { headers: requestHeaders } })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh expired auth tokens and propagate updated cookies before the
  // request reaches Server Components, Server Actions, or Route Handlers.
  await supabase.auth.getUser()

  response.cookies.set("fashdb-locale", locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  })
  return response
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon_io|.*\\.[^/]+$).*)"],
}
