import TagPageClient, { type Post } from "./[slug]/TagPageClient"
import { supabase } from "@/lib/supabase"

export default async function TagsPage() {
  const { data: links } = await supabase.from("post_tags").select("post_id")
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
      brands: Array.isArray(post.brands) ? post.brands[0] || null : post.brands,
      tags: [],
    } as Post]))
    for (const row of tagRows || []) {
      const post = postMap.get(row.post_id)
      const tag = Array.isArray(row.tags) ? row.tags[0] : row.tags
      if (post && tag) post.tags.push(tag)
    }
    posts = Array.from(postMap.values())
  }

  return <TagPageClient initialPosts={posts} />
}
