"use client"

import Link from "next/link"
import Image from "next/image"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

type Post = {
  id: string
  image_urls: string[]
  title: string | null
  description: string | null
  brand_slug: string | null
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
  const [isPlusMember, setIsPlusMember] = useState(false)

  useEffect(() => {
    const fetchPosts = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const isAdmin = 
          user?.user_metadata?.role === "admin" || 
          user?.role === "admin" ||
          user?.app_metadata?.role === "admin"

        const { data: memberData } = await supabase
          .from("users")
          .select("plus_member, plus_members, is_active")
          .eq("id", user.id)
          .maybeSingle()

        const hasValidFlag = 
          memberData?.plus_member === true || 
          memberData?.plus_members === true || 
          memberData?.is_active === true

        if (isAdmin || hasValidFlag) {
          setIsPlusMember(true)
        } else {
          setIsPlusMember(false)
        }
      }

      const { data, error } = await supabase
        .from("posts")
        .select(`
          *,
          users (
            id,
            username,
            display_name,
            avatar_url
          )
        `)
        .order("created_at", { ascending: false })

      if (error) {
        console.log(error)
        setLoading(false)
        return
      }

      setPosts(data || [])
      setLoading(false)
    }

    fetchPosts()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        window.location.reload()
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 animate-pulse">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="space-y-5">
            <div className="w-full aspect-[4/5] bg-neutral-100 rounded-2xl border border-neutral-200/60" />
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-neutral-100 border border-neutral-200/60" />
                <div className="h-4 bg-neutral-100 rounded w-24" />
              </div>
              <div className="h-6 bg-neutral-100 rounded w-3/4" />
              <div className="space-y-2">
                <div className="h-3.5 bg-neutral-100 rounded w-full" />
                <div className="h-3.5 bg-neutral-100 rounded w-5/6" />
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
        const prefix = post.brand_slug || "archive"
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

            <div className={`space-y-3 ${!isPlusMember ? "select-none pointer-events-none filter blur-[5px] opacity-50" : ""}`}>
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
                  <h2 className="text-xl font-medium group-hover:text-neutral-600 transition duration-200">
                    {post.title}
                  </h2>
                  <p className="mt-2 text-subtle leading-7 line-clamp-2">
                    {post.description}
                  </p>
                </div>
              </Link>
            </div>
          </article>
        )
      })}
    </div>
  )
}