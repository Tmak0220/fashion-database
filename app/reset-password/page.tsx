"use client"

import { useState } from "react"

import { supabase } from "@/lib/supabase"

export default function ResetPasswordPage() {

  const [password, setPassword] =
    useState("")

  const [loading, setLoading] =
    useState(false)

  const handleUpdate = async () => {

    if (!password) return

    setLoading(true)

    const { error } =
      await supabase.auth.updateUser({
        password,
      })

    if (error) {

      alert(error.message)

    } else {

      alert("Password updated")
    }

    setLoading(false)
  }

  return (
    <main className="max-w-md p-10">

      <h1 className="text-3xl">
        Reset Password
      </h1>

      <div className="mt-8 space-y-4">

        <input
          type="password"
          placeholder="New Password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
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
          onClick={handleUpdate}
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
          Update Password
        </button>

      </div>

    </main>
  )
}