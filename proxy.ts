import { NextResponse, type NextRequest } from "next/server"

type Locale = "ja" | "en"

export function proxy(request: NextRequest) {
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

  const response = NextResponse.rewrite(url, { request: { headers: requestHeaders } })
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
