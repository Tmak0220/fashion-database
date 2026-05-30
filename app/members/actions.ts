"use server"

import Stripe from "stripe"
import { createClient } from "@/lib/supabase-server"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function createCheckoutSession(origin: string) {
  try {
    // ログイン画面がクッキーに対応したため、サーバー側で100%安全にユーザーを特定できます
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // 実際の運用時、未ログインなら厳格にブロック
    if (!user) {
      return { error: "Unauthorized" }
    }

    // Stripeセッションの作成
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: process.env.STRIPE_PLUS_PRICE_ID!,
          quantity: 1,
        },
      ],
      // 成功時・キャンセル時のリダイレクト先
      success_url: `${origin}/members/success`,
      cancel_url: `${origin}/members`,
      
      // 💡 実際の運用で最も重要なポイント：
      // 決済完了時、Stripe Webhook(api/stripe-webhook) がこの user_id を受け取り、
      // Supabaseのusersテーブル（またはprofilesテーブル）のステータスを「premium」等に更新します。
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