import "server-only"

const fallbackPublicUrl = "https://images.fashdb.com"

export function getR2PublicUrl() {
  return (process.env.R2_PUBLIC_URL || fallbackPublicUrl).replace(/\/$/, "")
}

export function getR2KeyFromUrl(value: string) {
  const url = new URL(value)
  const publicUrl = new URL(getR2PublicUrl())
  if (url.origin !== publicUrl.origin) throw new Error("Invalid image host")

  const key = decodeURIComponent(url.pathname.replace(/^\/+/, ""))
  if (!key || key.includes("..") || key.includes("\\")) throw new Error("Invalid image key")
  return key
}

export function isOwnedTemporaryKey(key: string, userId: string) {
  return key.startsWith(`tmp/${userId}/`)
}

export function isOwnedAvatarKey(key: string, userId: string) {
  return key.startsWith(`avatars/${userId}/`)
}

export function isOwnedPostKey(key: string, userId: string) {
  // The second form keeps existing root-level uploads editable. New uploads
  // always use the posts/ prefix.
  return key.startsWith(`posts/${userId}/`) || key.startsWith(`${userId}/`)
}
