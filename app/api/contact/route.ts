import { NextResponse } from "next/server"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const { name, email, message, honey } = await request.json()

    if (honey) {
      return NextResponse.json({ success: true }) 
    }

    await resend.emails.send({
      from: "FASHION DATABASE <support@fashdb.com>",
      to: "rivu65622252@gmail.com",
      subject: `【お問い合わせ】${name}様より`,
      text: `お名前: ${name}\nメールアドレス: ${email}\n\n【本文】\n${message}`,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("メール送信エラー:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}