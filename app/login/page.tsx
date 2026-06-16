import { Suspense } from "react"
import LoginPageClient from "./LoginPageClient"

export default function LoginPage() {
  return (
    <Suspense fallback={<main className="min-h-screen p-10 flex items-center justify-center text-sm text-muted">読み込み中...</main>}>
      <LoginPageClient />
    </Suspense>
  )
}