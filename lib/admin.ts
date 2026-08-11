import "server-only"

import { createClient as createAdminClient } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase-server"

export async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const configuredEmails = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)
  const isAdmin = Boolean(user && (
    user.app_metadata?.role === "admin" ||
    user.user_metadata?.role === "admin" ||
    (user.email && configuredEmails.includes(user.email.toLowerCase()))
  ))
  if (!user || !isAdmin) throw new Error("管理者権限が必要です")
  return user
}

export function getAdminClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  )
}
