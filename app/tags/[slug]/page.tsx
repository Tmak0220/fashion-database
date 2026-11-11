import TagPageClient, { type Post, type Tag } from "./TagPageClient"
import type { Metadata } from "next"
import { supabase } from "@/lib/supabase"
import { localizedAlternates } from "@/lib/locale-server"
import { notFound } from "next/navigation"

type Props = {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const { data: tag } = await supabase
    .from("tags")
    .select("name, name_ja")
    .eq("slug", slug)
    .maybeSingle()
  const tagName = tag?.name_ja || tag?.name || decodeURIComponent(slug)
  const title = `#${tagName}のファッション投稿`
  const description = `「${tagName}」に関連するファッションアイテム、ブランド、デザイナーの投稿アーカイブです。`
  return {
    title,
    description,
    alternates: await localizedAlternates(`/tags/${slug}`),
    openGraph: { title, description, type: "website" },
    twitter: { card: "summary", title, description },
  }
}

export default async function TagPage({ params }: Props) {
  const { slug } = await params

  const { data: tagData } = await supabase
    .from("tags")
    .select("id, name, name_ja, slug")
    .eq("slug", slug)
    .maybeSingle()

  if (!tagData) notFound()

  const { data: links } = await supabase
    .from("post_tags")
    .select("post_id")
    .eq("tag_id", tagData.id)
  const postIds = Array.from(new Set((links || []).map((item) => item.post_id)))

  let posts: Post[] = []
  if (postIds.length) {
    const [{ data: postRows }, { data: tagRows }] = await Promise.all([
      supabase.from("posts").select("id, title, image_urls, brands!posts_brand_id_fkey(slug)").in("id", postIds),
      supabase.from("post_tags").select("post_id, tags(id, name, name_ja, slug)").in("post_id", postIds),
    ])
    const postMap = new Map((postRows || []).map((post) => [post.id, {
      id: post.id,
      title: post.title,
      image_urls: post.image_urls || [],
      tags: [],
      brands: Array.isArray(post.brands) ? post.brands[0] || null : post.brands,
    } as Post]))
    for (const row of tagRows || []) {
      const post = postMap.get(row.post_id)
      const relatedTag = Array.isArray(row.tags) ? row.tags[0] : row.tags
      if (post && relatedTag) post.tags.push(relatedTag)
    }
    posts = Array.from(postMap.values())
  }

  return <TagPageClient slug={slug} initialTag={tagData as Tag} initialPosts={posts} />
}
