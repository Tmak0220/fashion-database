import { NextResponse } from "next/server"
import Stripe from "stripe"
import { getRequestUser } from "@/lib/request-auth"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: Request) {
  try {
    const { origin } = new URL(req.url)
    const user = await getRequestUser(req)

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: process.env.STRIPE_PLUS_PRICE_ID!,
          quantity: 1,
        },
      ],
      billing_address_collection: "required",
      invoice_creation: {
        enabled: true,
      },
      success_url: `${origin}/success`,
      cancel_url: `${origin}/`,
      metadata: {
        user_id: user.id,
      },
      subscription_data: {
        metadata: {
          user_id: user.id,
        },
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Stripe Error" }, { status: 500 })
  }
}
