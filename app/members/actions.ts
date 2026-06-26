"use server"

import Stripe from "stripe"
import { createClient } from "@/lib/supabase-server"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function createCheckoutSession(origin: string) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { error: "Unauthorized" }
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
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

    return { url: session.url }
  } catch (error: any) {
    console.error("Stripe Session Creation Error:", error)
    return { error: error.message || "Stripe Error" }
  }
}