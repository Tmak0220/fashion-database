import { createClient as createSupabaseClient, type User } from "@supabase/supabase-js"
import { createClient as createServerClient } from "@/lib/supabase-server"

export async function getRequestUser(request: Request): Promise<User | null> {
  const authorization = request.headers.get("authorization")
  const token = authorization?.match(/^Bearer\s+(.+)$/i)?.[1]

  if (token) {
    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } }
    )
    const { data: { user }, error } = await supabase.auth.getUser(token)
    if (!error && user) return user
  }

  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}
