import { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/login",
        "/forgot-password",
        "/reset-password",
        "/edit-post",
        "/members",
        "/mypage",
      ],
    },
    sitemap: "https://fashdb.com/sitemap.xml",
  }
}