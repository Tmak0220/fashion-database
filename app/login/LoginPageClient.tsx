"use client"

import { useState, FormEvent } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

type StatusMessage = {
  text: string
  type: "error" | "success"
}

export default function LoginPageClient() {
  const router = useRouter()
  
  const [step, setStep] = useState<"auth" | "profile">("auth")
  const [createdUserId, setCreatedUserId] = useState<string | null>(null)
  const [createdEmail, setCreatedEmail] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState<StatusMessage | null>(null)

  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [loginLoading, setLoginLoading] = useState(false)

  const [signupEmail, setSignupEmail] = useState("")
  const [signupPassword, setSignupPassword] = useState("")
  const [signupLoading, setSignupLoading] = useState(false)

  const [username, setUsername] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [profileLoading, setProfileLoading] = useState(false)

  const showMessage = (text: string, type: "error" | "success") => {
    setStatusMessage({ text, type })
    setTimeout(() => setStatusMessage(null), 3000)
  }

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault()
    setLoginLoading(true)
    setStatusMessage(null)

    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword,
    })

    if (error) {
      setLoginLoading(false)
      showMessage(error.message, "error")
      return
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setLoginLoading(false)
      showMessage("ログインに失敗しました", "error")
      return
    }

    setLoginLoading(false)
    router.push("/")
    router.refresh()
  }

  const handleSignup = async (e: FormEvent) => {
    e.preventDefault()
    setSignupLoading(true)
    setStatusMessage(null)

    const { data, error } = await supabase.auth.signUp({
      email: signupEmail,
      password: signupPassword,
    })

    setSignupLoading(false)

    if (error) {
      showMessage(error.message, "error")
      return
    }

    if (data.user) {
      setCreatedUserId(data.user.id)
      setCreatedEmail(data.user.email ?? "")
      setStep("profile")
    }
  }

  const handleProfileSetup = async (e: FormEvent) => {
    e.preventDefault()
    if (!createdUserId) return
    setProfileLoading(true)

    const trimmedUsername = username.trim()
    const trimmedDisplayName = displayName.trim()
    const usernameRegex = /^[a-zA-Z0-9_-]+$/

    if (!trimmedUsername) {
      showMessage("ユーザー名を入力してください。", "error")
      setProfileLoading(false)
      return
    }

    if (!usernameRegex.test(trimmedUsername)) {
      showMessage("ユーザー名は半角英数字、ハイフン(-)、アンダースコア(_)のみ使用できます。", "error")
      setProfileLoading(false)
      return
    }

    const now = new Date().toISOString()

    const { error } = await supabase
      .from("users")
      .upsert({
        id: createdUserId,
        email: createdEmail,
        username: trimmedUsername,
        display_name: trimmedDisplayName || trimmedUsername,
        created_at: now,
        updated_at: now,
      })

    if (error) {
      setProfileLoading(false)
      if (error.code === "23505") {
        showMessage("このユーザー名はすでに使用されています。", "error")
      } else {
        showMessage(`プロフィールの保存に失敗しました: ${error.message}`, "error")
      }
      return
    }

    setProfileLoading(false)
    router.push("/")
    router.refresh()
  }

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-8 md:p-14 lg:p-16">
      <div className="w-full max-w-5xl">
        
        {step === "auth" ? (
          <div className="flex flex-col md:flex-row items-stretch gap-16 md:gap-0">
            <form onSubmit={handleLogin} className="flex-1 md:pr-16 flex flex-col justify-between">
              <div>
                <div className="flex flex-col gap-2">
                  <h1 className="type-brand text-3xl md:text-4xl tracking-[0.14em] pr-[0.14em]">LOGIN</h1>
                  <p className="text-xs tracking-[0.12em] text-muted font-medium">ユーザーログイン</p>
                </div>
                <div className="mt-12 flex flex-col gap-4">
                  <input
                    type="email"
                    placeholder="EMAIL"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                    className="border border-border bg-surface rounded-xl px-5 py-4 outline-none text-sm focus:border-muted text-foreground"
                  />
                  <input
                    type="password"
                    placeholder="PASSWORD"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                    className="border border-border bg-surface rounded-xl px-5 py-4 outline-none text-sm focus:border-muted text-foreground"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loginLoading}
                className="type-ui mt-10 w-full border border-border rounded-xl px-6 py-4 text-sm tracking-[0.1em] bg-surface text-foreground hover:bg-foreground hover:text-background transition-colors disabled:opacity-50"
              >
                {loginLoading ? "読み込み中..." : "ログイン"}
              </button>
            </form>

            <div className="border-b border-border md:border-b-0 md:border-r opacity-60" />

            <form onSubmit={handleSignup} className="flex-1 md:pl-16 flex flex-col justify-between mt-4 md:mt-0">
              <div>
                <div className="flex flex-col gap-2">
                  <h1 className="type-brand text-3xl md:text-4xl tracking-[0.14em] pr-[0.14em]">SIGN UP</h1>
                  <p className="text-xs tracking-[0.12em] text-muted font-medium">新規アカウント登録</p>
                </div>
                <div className="mt-12 flex flex-col gap-4">
                  <input
                    type="email"
                    placeholder="EMAIL"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    required
                    className="border border-border bg-surface rounded-xl px-5 py-4 outline-none text-sm focus:border-muted text-foreground"
                  />
                  <input
                    type="password"
                    placeholder="PASSWORD"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    required
                    className="border border-border bg-surface rounded-xl px-5 py-4 outline-none text-sm focus:border-muted text-foreground"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={signupLoading}
                className="type-ui mt-10 w-full border border-border rounded-xl px-6 py-4 text-sm tracking-[0.1em] bg-surface text-foreground hover:bg-foreground hover:text-background transition-colors disabled:opacity-50"
              >
                {signupLoading ? "読み込み中..." : "新規登録"}
              </button>
            </form>
          </div>
        ) : (
          <form onSubmit={handleProfileSetup} className="max-w-md mx-auto flex flex-col justify-between min-h-[500px]">
            <div className="space-y-8">
              <div className="flex flex-col gap-2">
                <h1 className="type-brand text-3xl md:text-4xl tracking-[0.14em] pr-[0.14em]">WELCOME</h1>
                <p className="text-xs tracking-[0.12em] text-muted font-medium">アカウントの初期設定を行います</p>
              </div>

              <div>
                <p className="text-sm mb-1 tracking-[0.14em] text-muted font-medium">DISPLAY NAME</p>
                <p className="text-xs text-muted mb-2">※画面上に表示される名前です。漢字やひらがなも使用できます。</p>
                <input
                  type="text"
                  placeholder="表示名（例：FASHION DATABASE）"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full border border-border bg-surface rounded-xl px-5 py-4 outline-none text-sm focus:border-muted text-foreground"
                />
              </div>

              <div>
                <p className="text-sm mb-1 tracking-[0.14em] text-muted font-medium">USER ID (@username)</p>
                <p className="text-xs text-muted mb-2">※プロフィールURL等に使用される固有のIDです。半角英数字、ハイフン(-)、アンダースコア(_)が使用できます。</p>
                <input
                  type="text"
                  placeholder="USERNAME"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full border border-border bg-surface rounded-xl px-5 py-4 outline-none text-sm focus:border-muted text-foreground"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={profileLoading}
              className="type-ui mt-10 w-full border border-border rounded-xl px-6 py-4 text-sm tracking-[0.1em] bg-surface text-foreground hover:bg-foreground hover:text-background transition-colors disabled:opacity-50"
            >
              {profileLoading ? "設定中..." : "登録を完了してはじめる"}
            </button>
          </form>
        )}

      </div>

      {statusMessage && (
        <div className={`mt-12 w-full max-w-5xl text-xs p-4 rounded-xl border ${
          statusMessage.type === "error" 
            ? "text-red-500 bg-red-50/50 border-red-200" 
            : "text-foreground bg-neutral-50 border-border"
        }`}>
          {statusMessage.text}
        </div>
      )}
    </main>
  )
}