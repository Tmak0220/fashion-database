"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"

import { supabase } from "@/lib/supabase"

export default function AuthPage() {

  const router = useRouter()

  // login

  const [loginEmail, setLoginEmail] =
    useState("")

  const [loginPassword, setLoginPassword] =
    useState("")

  const [loginLoading, setLoginLoading] =
    useState(false)

  // signup

  const [signupEmail, setSignupEmail] =
    useState("")

  const [signupPassword, setSignupPassword] =
    useState("")

  const [signupLoading, setSignupLoading] =
    useState(false)

  // login

  const handleLogin = async () => {

    setLoginLoading(true)

    const { error } =
      await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      })

    if (error) {

      setLoginLoading(false)

      alert(error.message)

      return
    }

    // session確認

    const {
      data: { user },
    } = await supabase.auth.getUser()

    console.log("AUTH USER", user)

    if (!user) {

      setLoginLoading(false)

      alert("ログインに失敗しました")

      return
    }

    // users table 作成 / 更新

    const { error: profileError } =
      await supabase
        .from("users")
        .upsert({
          id: user.id,
          email: user.email,
        })

    if (profileError) {

      console.log(profileError)
    }

    setLoginLoading(false)

    router.push("/mypage")

    router.refresh()
  }

  // signup

  const handleSignup = async () => {

    setSignupLoading(true)

    const { error } =
      await supabase.auth.signUp({
        email: signupEmail,
        password: signupPassword,
      })

    setSignupLoading(false)

    if (error) {

      alert(error.message)

      return
    }

    alert("確認メールを送信しました")
  }

  return (

    <main
      className="
        min-h-screen
        bg-background
        text-foreground
        flex
        items-center
        justify-center
        p-8
        md:p-14
        lg:p-16
      "
    >

      <div
        className="
          w-full
          max-w-5xl
          flex
          flex-col
          md:flex-row
          items-stretch
          gap-16
          md:gap-0
        "
      >

        {/* login */}

        <section
          className="
            flex-1
            md:pr-16
            flex
            flex-col
            justify-between
          "
        >

          <div>

            <div className="flex flex-col gap-2">

              <h1
                className="
                  type-brand
                  text-3xl
                  md:text-4xl
                "
                style={{
                  letterSpacing: "0.14em",
                  paddingRight: "0.14em",
                }}
              >
                LOGIN
              </h1>

              <p
                className="
                  text-xs
                  tracking-[0.12em]
                  text-muted
                  font-medium
                "
              >
                ユーザーログイン
              </p>

            </div>

            <div
              className="
                mt-12
                flex
                flex-col
                gap-4
              "
            >

              <input
                type="email"
                placeholder="Email"
                value={loginEmail}
                onChange={(e) =>
                  setLoginEmail(
                    e.target.value
                  )
                }
                className="
                  border
                  border-border
                  bg-surface
                  rounded-xl
                  px-5
                  py-4
                  outline-none
                  text-sm
                  transition-colors
                  focus:border-muted
                "
              />

              <input
                type="password"
                placeholder="Password"
                value={loginPassword}
                onChange={(e) =>
                  setLoginPassword(
                    e.target.value
                  )
                }
                className="
                  border
                  border-border
                  bg-surface
                  rounded-xl
                  px-5
                  py-4
                  outline-none
                  text-sm
                  transition-colors
                  focus:border-muted
                "
              />

              <div
                className="
                  flex
                  justify-end
                  mt-1
                "
              >

                <Link
                  href="/forgot-password"
                  className="
                    text-xs
                    tracking-[0.06em]
                    text-subtle
                    hover:text-foreground
                    transition-colors
                  "
                >
                  パスワードを忘れた場合
                </Link>

              </div>

            </div>

          </div>

          <button
            onClick={handleLogin}
            disabled={loginLoading}
            className="
              type-ui
              mt-10
              w-full
              border
              border-border
              rounded-xl
              px-6
              py-4
              text-sm
              tracking-[0.1em]
              bg-surface
              text-foreground
              hover:bg-foreground
              hover:text-background
              transition-colors
              duration-300
              disabled:opacity-50
            "
          >
            {loginLoading
              ? "LOADING..."
              : "ログイン"}
          </button>

        </section>

        {/* border */}

        <div
          className="
            border-b
            border-border
            md:border-b-0
            md:border-r
            opacity-60
          "
        />

        {/* signup */}

        <section
          className="
            flex-1
            md:pl-16
            flex
            flex-col
            justify-between
            mt-4
            md:mt-0
          "
        >

          <div>

            <div className="flex flex-col gap-2">

              <h1
                className="
                  type-brand
                  text-3xl
                  md:text-4xl
                "
                style={{
                  letterSpacing: "0.14em",
                  paddingRight: "0.14em",
                }}
              >
                SIGN UP
              </h1>

              <p
                className="
                  text-xs
                  tracking-[0.12em]
                  text-muted
                  font-medium
                "
              >
                新規アカウント登録
              </p>

            </div>

            <div
              className="
                mt-12
                flex
                flex-col
                gap-4
              "
            >

              <input
                type="email"
                placeholder="Email"
                value={signupEmail}
                onChange={(e) =>
                  setSignupEmail(
                    e.target.value
                  )
                }
                className="
                  border
                  border-border
                  bg-surface
                  rounded-xl
                  px-5
                  py-4
                  outline-none
                  text-sm
                  transition-colors
                  focus:border-muted
                "
              />

              <input
                type="password"
                placeholder="Password"
                value={signupPassword}
                onChange={(e) =>
                  setSignupPassword(
                    e.target.value
                  )
                }
                className="
                  border
                  border-border
                  bg-surface
                  rounded-xl
                  px-5
                  py-4
                  outline-none
                  text-sm
                  transition-colors
                  focus:border-muted
                "
              />

            </div>

          </div>

          <button
            onClick={handleSignup}
            disabled={signupLoading}
            className="
              type-ui
              mt-10
              w-full
              border
              border-border
              rounded-xl
              px-6
              py-4
              text-sm
              tracking-[0.1em]
              bg-surface
              text-foreground
              hover:bg-foreground
              hover:text-background
              transition-colors
              duration-300
              disabled:opacity-50
            "
          >
            {signupLoading
              ? "LOADING..."
              : "新規登録"}
          </button>

        </section>

      </div>

    </main>

  )
}