import "server-only"

import { createClient as createAdminClient } from "@supabase/supabase-js"
import type { User } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase-server"

export function isAdminUser(user: User | null): boolean {
  if (!user) return false

  const configuredEmails = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)

  return (
    user.app_metadata?.role === "admin" ||
    Boolean(user.email && configuredEmails.includes(user.email.toLowerCase()))
  )
}

export async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!isAdminUser(user)) throw new Error("管理者権限が必要です")
  return user
}

export function getAdminClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  )
}
