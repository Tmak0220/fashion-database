"use client"

import Link from "next/link"
import Image from "next/image"
import { useEffect, useMemo, useState } from "react"
import { supabase } from "@/lib/supabase"
import TagsLoading from "./loading"

type Tag = {
  id: string
  name: string
  name_ja: string | null
  slug: string
}

type RelatedTag = {
  id: string
  name: string
  name_ja: string | null
  slug: string
}

type Post = {
  id: string
  title: string | null
  image_urls: string[]
  tags: RelatedTag[]
}

type GroupedPosts = {
  tag: RelatedTag
  posts: Post[]
}

type PostTagResponse = {
  post_id: string
  tags: Tag | null
}

type Props = {
  slug?: string
}

const PREFERRED_ORDER = [
  "mens",
  "womens",
  "coat",
  "jacket",
  "blouson",
  "suits",
  "sweater",
  "shirts",
  "t-shirts",
  "pants",
  "shoes",
  "bag",
  "accessories",
  "leather",
  "denim",
  "fur",
  "down"
]

export default function TagPageClient({ slug = "" }: Props) {
  const [tag, setTag] = useState<Tag | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [isPlusMember, setIsPlusMember] = useState(false)

  const isAllTagsMode = !slug

  useEffect(() => {
    const checkMemberStatus = async (user: any) => {
      if (user) {
        const isAdmin = user?.user_metadata?.role === "admin" || user?.role === "admin" || user?.app_metadata?.role === "admin"
        const { data: memberData } = await supabase
          .from("users")
          .select("plus_member, plus_members, is_active")
          .eq("id", user.id)
          .maybeSingle()
        const hasValidFlag = memberData?.plus_member === true || memberData?.plus_members === true || memberData?.is_active === true
        setIsPlusMember(isAdmin || hasValidFlag)
      } else {
        setIsPlusMember(false)
      }
    }

    const fetchTagsAndPosts = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      await checkMemberStatus(user)

      let postIds: string[] = []

      if (isAllTagsMode) {
        const { data: postTagsData, error: postTagsError } = await supabase
          .from("post_tags")
          .select("post_id")

        if (postTagsError) {
          console.error(postTagsError)
          setLoading(false)
          return
        }
        postIds = Array.from(new Set(postTagsData?.map((item) => item.post_id).filter(Boolean))) || []
      } else {
        const { data: currentTag, error: tagError } = await supabase
          .from("tags")
          .select("id, name, name_ja, slug")
          .eq("slug", slug)
          .single()

        if (tagError || !currentTag) {
          console.error(tagError)
          setLoading(false)
          return
        }
        setTag(currentTag)

        const { data: postTagsData, error: postTagsError } = await supabase
          .from("post_tags")
          .select("post_id")
          .eq("tag_id", currentTag.id)

        if (postTagsError) {
          console.error(postTagsError)
          setLoading(false)
          return
        }
        postIds = postTagsData?.map((item) => item.post_id).filter(Boolean) || []
      }

      if (postIds.length === 0) {
        setPosts([])
        setLoading(false)
        return
      }

      const [postsResult, allRelatedTagsResult] = await Promise.all([
        supabase
          .from("posts")
          .select("id, title, image_urls")
          .in("id", postIds),
        supabase
          .from("post_tags")
          .select(`
            post_id,
            tags (
              id,
              name,
              name_ja,
              slug
            )
          `)
          .in("post_id", postIds)
      ])

      if (postsResult.error || allRelatedTagsResult.error) {
        console.error(postsResult.error || allRelatedTagsResult.error)
        setLoading(false)
        return
      }

      const postMap = new Map<string, Post>()

      postsResult.data?.forEach((p) => {
        postMap.set(p.id, {
          id: p.id,
          title: p.title,
          image_urls: p.image_urls || [],
          tags: []
        })
      })

      const rawTagsData = allRelatedTagsResult.data as unknown as PostTagResponse[]
      rawTagsData?.forEach((item) => {
        const existingPost = postMap.get(item.post_id)
        const tagData = item.tags
        if (!existingPost || !tagData) return
        existingPost.tags.push(tagData)
      })

      setPosts(Array.from(postMap.values()))
      setLoading(false)
    }

    fetchTagsAndPosts()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT") {
        setIsPlusMember(false)
      } else if (event === "SIGNED_IN" || event === "USER_UPDATED") {
        await checkMemberStatus(session?.user)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [slug, isAllTagsMode])

  const groupedPosts = useMemo<GroupedPosts[]>(() => {
    const groups = new Map<string, GroupedPosts>()

    posts.forEach((post) => {
      const availableTags = isAllTagsMode 
        ? post.tags 
        : post.tags.filter((t) => t.slug !== tag?.slug)
        
      if (availableTags.length === 0) return

      const assignedTag = [...availableTags].sort((a, b) => {
        let idxA = PREFERRED_ORDER.indexOf(a.slug.toLowerCase())
        let idxB = PREFERRED_ORDER.indexOf(b.slug.toLowerCase())
        return (idxA === -1 ? Infinity : idxA) - (idxB === -1 ? Infinity : idxB)
      })[0]

      const existing = groups.get(assignedTag.slug)
      if (existing) {
        existing.posts.push(post)
      } else {
        groups.set(assignedTag.slug, {
          tag: assignedTag,
          posts: [post],
        })
      }
    })

    return Array.from(groups.values())
      .map((group) => ({
        ...group,
        posts: group.posts.slice(0, 30),
      }))
      .sort((a, b) => {
        let indexA = PREFERRED_ORDER.indexOf(a.tag.slug.toLowerCase())
        let indexB = PREFERRED_ORDER.indexOf(b.tag.slug.toLowerCase())
        if (indexA === -1) indexA = Infinity
        if (indexB === -1) indexB = Infinity
        return indexA - indexB
      })
  }, [posts, tag, isAllTagsMode])

  if (loading) {
    return <TagsLoading />
  }

  if (!isAllTagsMode && !tag) {
    return <main className="p-10 md:p-14 lg:p-16 text-sm text-muted">TAG NOT FOUND</main>
  }

  return (
    <main className="max-w-7xl mx-auto p-10 md:p-14 lg:p-16 min-h-screen">
      {isAllTagsMode ? (
        <section className="max-w-4xl">
          <p className="type-label text-[11px] tracking-[0.12em] text-subtle">ARCHIVES</p>
          <h1 className="mt-6 type-brand text-5xl md:text-6xl tracking-[0.05em] text-foreground">
            TAGS
          </h1>
          <p className="mt-4 text-sm tracking-wider text-muted font-medium">タグ一覧から探す</p>
        </section>
      ) : (
        tag && (
          <section className="max-w-4xl">
            <p className="type-label text-[11px] tracking-[0.12em] text-subtle">TAG</p>
            <h1 className="mt-6 type-brand text-5xl md:text-6xl tracking-[0.05em] text-foreground">
              {tag.name.toUpperCase()}
            </h1>
            {tag.name_ja && (
              <p className="mt-4 text-sm sm:text-base tracking-wider text-muted font-medium">{tag.name_ja}</p>
            )}
          </section>
        )
      )}

      {/* 修正点: top-20 (ヘッダーの高さ分) を空けて固定することでヘッダーを殺さないように変更 */}
      {!isPlusMember && (
        <div className="fixed top-20 bottom-0 left-0 right-0 z-40 flex items-center justify-center p-4 bg-transparent pointer-events-auto">
          <div className="max-w-sm w-full h-fit p-6 sm:p-8 border border-border bg-white rounded-2xl shadow-2xl text-center">
            <h2 className="text-base font-semibold tracking-[0.05em] text-foreground">
              MEMBER限定コンテンツ
            </h2>
            <p className="mt-3 text-xs text-muted leading-relaxed">
              アーカイブの詳細や解説の閲覧、およびすべての機能を利用するにはMEMBER登録が必要です。
            </p>
            <Link
              href="/members"
              className="mt-6 block w-full text-center bg-black text-white font-medium rounded-xl px-4 py-3 text-[12px] transition-colors duration-300 hover:bg-neutral-800"
            >
              MEMBERに登録する
            </Link>
            <Link 
              href="/" 
              className="mt-4 inline-block text-[11px] text-subtle hover:text-foreground transition-colors duration-300"
            >
              トップページに戻る
            </Link>
          </div>
        </div>
      )}

      <div className="mt-20">
        <section className="space-y-24">
          {posts.length > 0 && groupedPosts.length === 0 && (
            <p className="text-sm text-muted">関連投稿はありません</p>
          )}

          {groupedPosts.map((group) => (
            <section key={group.tag.slug} className="space-y-8">
              <div className="border-b border-border pb-3">
                {isPlusMember ? (
                  <Link href={`/tags/${group.tag.slug}`} className="inline-block hover:opacity-60 transition duration-200">
                    <h2 className="type-brand text-2xl tracking-[0.08em] font-medium text-foreground">
                      {group.tag.name.toUpperCase()}
                    </h2>
                    {group.tag.name_ja && <p className="mt-1 text-xs text-subtle">{group.tag.name_ja}</p>}
                  </Link>
                ) : (
                  <div className="inline-block">
                    <h2 className="type-brand text-2xl tracking-[0.08em] font-medium text-foreground">
                      {group.tag.name.toUpperCase()}
                    </h2>
                    {group.tag.name_ja && <p className="mt-1 text-xs text-subtle">{group.tag.name_ja}</p>}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {group.posts.map((post) => {
                  const content = (
                    <article className="space-y-3">
                      <div className="relative overflow-hidden rounded-xl border border-border bg-surface w-full aspect-[4/5]">
                        {post.image_urls?.[0] && (
                          <Image
                            src={post.image_urls[0]}
                            alt={isPlusMember ? (post.title || "") : ""}
                            fill
                            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                            priority
                            className="object-cover opacity-100"
                          />
                        )}
                      </div>
                      {post.title && (
                        <p className={`text-xs sm:text-sm font-medium leading-snug text-foreground ${
                          !isPlusMember ? "filter blur-[4px] select-none pointer-events-none" : ""
                        }`}>
                          {post.title}
                        </p>
                      )}
                    </article>
                  )

                  return isPlusMember ? (
                    <Link 
                      key={`${group.tag.slug}-${post.id}`} 
                      href={`/posts/archive-${post.id}`} 
                      className="block group opacity-100 hover:opacity-90 transition duration-200"
                    >
                      {content}
                    </Link>
                  ) : (
                    <div key={`${group.tag.slug}-${post.id}`} className="block">
                      {content}
                    </div>
                  )
                })}
              </div>
            </section>
          ))}
        </section>
      </div>
    </main>
  )
}