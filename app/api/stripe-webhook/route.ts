import { NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@supabase/supabase-js"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  const body = await req.text()
  const signature = req.headers.get("stripe-signature")

  if (!signature) {
    return new NextResponse("Missing signature", { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error("Webhook signature error:", err)
    return new NextResponse("Invalid signature", { status: 400 })
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session
      const userId = session.metadata?.user_id

      if (!userId) {
        console.error("No user_id in metadata")
        return NextResponse.json({ received: true })
      }

      const { error } = await supabase
        .from("users")
        .update({ plus_member: true })
        .eq("id", userId)

      if (error) throw error
    }

    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object as Stripe.Subscription
      let userId = subscription.metadata?.user_id

      if (!userId) {
        const customerId = subscription.customer as string
        const { data: customerPost } = await stripe.customers.retrieve(customerId) as any
        userId = customerPost?.metadata?.user_id
      }

      if (!userId) {
        console.error("No user_id found for subscription deletion")
        return NextResponse.json({ received: true })
      }

      const { error } = await supabase
        .from("users")
        .update({ plus_member: false })
        .eq("id", userId)

      if (error) throw error
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error("Webhook handler error:", err)
    return new NextResponse("Webhook Error", { status: 500 })
  }
}