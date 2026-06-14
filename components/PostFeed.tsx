"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

type Post = {
  id: string
  image_urls: string[]
  title: string | null
  description: string | null
  created_at: string
  users: {
    id: string
    username: string | null
    avatar_url: string | null
  }
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
    return <p>Loading...</p>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
      {posts.map((post) => (
        <article key={post.id} className="space-y-5">
          <div className="relative">
            <Link href={`/posts/${post.id}`} className="block">
              <img
                src={post.image_urls?.[0]}
                alt=""
                className="w-full aspect-[4/5] object-cover rounded-2xl border border-border"
              />
            </Link>
          </div>

          <div className={`space-y-3 ${!isPlusMember ? "select-none pointer-events-none filter blur-[5px] opacity-50" : ""}`}>
            <div className="flex items-center gap-3">
              {post.users?.avatar_url && (
                <img
                  src={post.users.avatar_url}
                  alt=""
                  className="w-10 h-10 rounded-full object-cover"
                />
              )}
              <span className="text-sm">
                {post.users?.username || "名称非公開"}
              </span>
            </div>

            <Link href={`/posts/${post.id}`} className="block">
              <div>
                <h2 className="text-xl">{post.title}</h2>
                <p className="mt-2 text-subtle leading-7">{post.description}</p>
              </div>
            </Link>
          </div>
        </article>
      ))}
    </div>
  )
}