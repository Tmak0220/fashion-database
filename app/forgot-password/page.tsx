"use client"

import { useState } from "react"

import { supabase } from "@/lib/supabase"

export default function ForgotPasswordPage() {

  const [email, setEmail] =
    useState("")

  const [loading, setLoading] =
    useState(false)

  const [sent, setSent] =
    useState(false)

  const handleReset = async () => {

    if (!email) return

    setLoading(true)

    const { error } =
      await supabase.auth.resetPasswordForEmail(
        email,
        {
          redirectTo:
            "http://localhost:3000/reset-password",
        }
      )

    if (error) {

      alert(error.message)

    } else {

      setSent(true)
    }

    setLoading(false)
  }

  return (
    <main className="max-w-md p-10">

      <h1 className="text-3xl">
        Forgot Password
      </h1>

      <p className="mt-4 text-sm text-subtle">
        登録メールアドレスに
        パスワード再設定リンクを送信します。
      </p>

      {sent ? (

        <p className="mt-8">
          Reset email sent.
        </p>

      ) : (

        <div className="mt-8 space-y-4">

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            className="
              w-full
              border
              border-border
              rounded-xl
              px-4
              py-3
            "
          />

          <button
            onClick={handleReset}
            disabled={loading}
            className="
              w-full
              border
              border-border
              rounded-xl
              px-4
              py-3
              hover:bg-black
              hover:text-white
              transition
            "
          >
            Send Reset Link
          </button>

        </div>

      )}

    </main>
  )
}