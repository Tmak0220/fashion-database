"use client"

import Link from "@/components/LocalizedLink"
import Image from "next/image"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import AutoTranslatedText from "@/components/AutoTranslatedText"

type Post = {
  id: string
  image_urls: string[]
  title: string | null
  description: string | null
  brands: { slug: string } | null
  created_at: string
  users: {
    id: string
    username: string | null
    display_name: string | null
    avatar_url: string | null
  } | null
}

export default function PostFeed() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPosts = async () => {
      const { data, error } = await supabase
        .from("posts")
        .select(`
          *,
          users (
            id,
            username,
            display_name,
            avatar_url
          ),
          brands!posts_brand_id_fkey (slug)
        `)
        .order("created_at", { ascending: false })

      if (error) {
        console.log(error)
        setLoading(false)
        return
      }

      setPosts((data || []).map((post) => ({
        ...post,
        users: Array.isArray(post.users) ? post.users[0] || null : post.users,
        brands: Array.isArray(post.brands) ? post.brands[0] || null : post.brands,
      })))
      setLoading(false)
    }

    fetchPosts()

  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <div key={item} className="space-y-5 animate-pulse">
            <div className="w-full aspect-[4/5] bg-neutral-200/60 rounded-2xl border border-neutral-200/30" />
            <div className="space-y-4 px-1">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-neutral-200/60 border border-neutral-200/30 shrink-0" />
                <div className="h-3.5 bg-neutral-200/50 rounded w-24" />
              </div>
              <div className="h-5 bg-neutral-200/60 rounded w-11/12" />
              <div className="space-y-2">
                <div className="h-3.5 bg-neutral-200/50 rounded w-full" />
                <div className="h-3.5 bg-neutral-200/40 rounded w-4/5" />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
      {posts.map((post) => {
        const prefix = post.brands?.slug || "archive"
        const postHref = `/posts/${prefix}-${post.id}`

        return (
          <article key={post.id} className="space-y-5">
            <div className="relative w-full aspect-[4/5]">
              <Link href={postHref} className="block w-full h-full">
                {post.image_urls?.[0] && (
                  <Image
                    src={post.image_urls[0]}
                    alt={post.title || "投稿画像"}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover rounded-2xl border border-border"
                  />
                )}
              </Link>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                {post.users?.avatar_url && (
                  <Image
                    src={post.users.avatar_url}
                    alt=""
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full object-cover border border-border"
                  />
                )}
                <span className="text-sm font-medium">
                  {post.users?.display_name || post.users?.username || "名称非公開"}
                </span>
              </div>

              <Link href={postHref} className="block group">
                <div>
                  <AutoTranslatedText
                    text={post.title}
                    as="h2"
                    showControls={false}
                    className="text-xl font-medium group-hover:text-neutral-600 transition duration-200"
                  />
                  <AutoTranslatedText
                    text={post.description}
                    as="p"
                    showControls={false}
                    className="mt-2 text-subtle leading-7 line-clamp-2"
                  />
                </div>
              </Link>
            </div>
          </article>
        )
      })}
    </div>
  )
}
