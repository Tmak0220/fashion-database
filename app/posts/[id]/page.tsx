import type { Metadata } from "next"
import { cache } from "react"
import { notFound, permanentRedirect } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { getRequestLocale, localizedAlternates } from "@/lib/locale-server"
import { SITE_URL } from "@/lib/site"
import PostPageClient, { type Post } from "./PostPageClient"

type Props = {
  params: Promise<{
    id: string
  }>
}

function extractUuid(paramId: string): string {
  if (paramId.length >= 36) {
    return paramId.slice(-36)
  }
  return paramId
}

const relationOne = <T,>(value: T | T[] | null): T | null =>
  Array.isArray(value) ? value[0] || null : value

const getPost = cache(async (id: string): Promise<Post | null> => {
  const { data: rawPost } = await supabase
    .from("posts")
    .select(`
      id, title, description, image_urls, created_at, user_id,
      brand_id, designer_id, collection_id, year, season,
      users:profiles!posts_user_id_fkey (id, username, display_name, avatar_url),
      post_tags (tags (slug, name))
    `)
    .eq("id", id)
    .maybeSingle()

  if (!rawPost) return null

  const [brandResult, designerResult] = await Promise.all([
    rawPost.brand_id
      ? supabase
          .from("brands")
          .select("slug, name, regions(slug), countries(slug)")
          .eq("id", rawPost.brand_id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    rawPost.designer_id
      ? supabase
          .from("designers")
          .select("slug, name, regions(slug), countries(slug)")
          .eq("id", rawPost.designer_id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ])

  const brand = brandResult.data
    ? {
        ...brandResult.data,
        regions: relationOne(brandResult.data.regions),
        countries: relationOne(brandResult.data.countries),
      }
    : null
  const designer = designerResult.data
    ? {
        ...designerResult.data,
        regions: relationOne(designerResult.data.regions),
        countries: relationOne(designerResult.data.countries),
      }
    : null

  return {
    ...rawPost,
    image_urls: rawPost.image_urls || [],
    users: relationOne(rawPost.users),
    brands: brand,
    designers: designer,
    post_tags: (rawPost.post_tags || []).map((item) => ({
      tags: relationOne(item.tags),
    })).filter((item) => item.tags),
  } as Post
})

const postPath = (post: Post) =>
  `/posts/${post.brands?.slug || "archive"}-${post.id}`

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id: paramId } = await params
  const actualId = extractUuid(paramId)

  const post = await getPost(actualId)

  if (!post) {
    return {
      title: "投稿が見つかりません",
      robots: { index: false, follow: false },
    }
  }

  const canonicalPath = postPath(post)
  if (`/posts/${paramId}` !== canonicalPath) {
    const locale = await getRequestLocale()
    permanentRedirect(`${locale === "en" ? "/en" : ""}${canonicalPath}`)
  }

  const title = post?.title || "ファッションアーカイブ投稿"
  const description = post?.description ? post.description.slice(0, 120) : "ファッションデータベースのアーカイブ投稿詳細ページです。"
  const alternates = await localizedAlternates(canonicalPath)
  const images = post.image_urls.map((url) => ({ url, alt: post.title || "投稿画像" }))

  return {
    title,
    description,
    alternates,
    openGraph: {
      title,
      description,
      url: alternates.canonical,
      siteName: "ファッションデータベース",
      type: "article",
      images,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: post.image_urls.slice(0, 1),
    },
  }
}

export default async function Page({ params }: Props) {
  const { id: paramId } = await params
  const actualId = extractUuid(paramId)
  const post = await getPost(actualId)

  if (!post) notFound()

  const canonicalPath = postPath(post)
  if (`/posts/${paramId}` !== canonicalPath) {
    const locale = await getRequestLocale()
    permanentRedirect(`${locale === "en" ? "/en" : ""}${canonicalPath}`)
  }

  const url = `${SITE_URL}${canonicalPath}`
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ImageGallery",
    name: post.title || "ファッションアーカイブ投稿",
    description: post.description || undefined,
    url,
    dateCreated: post.created_at,
    creator: post.users
      ? {
          "@type": "Person",
          name: post.users.display_name || post.users.username || "名称非公開",
        }
      : undefined,
    associatedMedia: post.image_urls.map((contentUrl) => ({
      "@type": "ImageObject",
      contentUrl,
      name: post.title || "投稿画像",
      caption: post.description || undefined,
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <PostPageClient id={actualId} initialPost={post} />
    </>
  )
}
