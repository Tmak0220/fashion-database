import { NextResponse } from "next/server"
import { Resend } from "resend"
import { checkRateLimit, getClientAddress } from "@/lib/rate-limit"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const origin = request.headers.get("origin")
    if (origin && new URL(origin).host !== request.headers.get("host")) {
      return NextResponse.json({ error: "Invalid origin" }, { status: 403 })
    }

    const rateLimit = checkRateLimit(`contact:${getClientAddress(request)}`, 5, 60 * 60 * 1000)
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } }
      )
    }

    const body = (await request.json().catch(() => null)) as Record<string, unknown> | null
    const name = typeof body?.name === "string" ? body.name.trim() : ""
    const email = typeof body?.email === "string" ? body.email.trim() : ""
    const message = typeof body?.message === "string" ? body.message.trim() : ""
    const honey = typeof body?.honey === "string" ? body.honey : ""

    if (honey) {
      return NextResponse.json({ success: true }) 
    }

    if (!name || name.length > 80 || !message || message.length > 5000 || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid form data" }, { status: 400 })
    }

    const { error } = await resend.emails.send({
      from: "FASHION DATABASE <contact@pct-e.com>",
      to: process.env.CONTACT_EMAIL || "rivu65622252@gmail.com",
      subject: `【お問い合わせ】${name}様より`,
      text: `お名前: ${name}\nメールアドレス: ${email}\n\n【本文】\n${message}`,
    })
    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("メール送信エラー:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
