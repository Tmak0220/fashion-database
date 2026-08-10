const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "")

export const SITE_URL = configuredSiteUrl || "https://fashion-database-app.com"
