import { NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@/lib/supabase-server"

const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY!
)

// 👇 1. 引数に「req: Request」を追加
export async function POST(req: Request) {

  try {

    // 👇 2. リクエストのURLから動的に「origin」を取得するこの一文を追加
    const { origin } = new URL(req.url)

    // supabase user取得
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      )
    }

    // checkout session
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: process.env.STRIPE_PLUS_PRICE_ID!,
          quantity: 1,
        },
      ],
      success_url: `${origin}/members/success`,
      cancel_url: `${origin}/members`,
      metadata: {
        user_id: user.id,
      },
      subscription_data: {
        metadata: {
          user_id: user.id,
        },
      },
    })

    return NextResponse.json({
      url: session.url,
    })

  } catch (error) {
    console.error(error)
    return NextResponse.json(
      {
        error: "Stripe Error",
      },
      {
        status: 500,
      }
    )
  }
}