"use client"

import Link from "next/link"

import {
  useEffect,
  useMemo,
  useState,
} from "react"

import { supabase } from "@/lib/supabase"

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

type Props = {
  slug: string
}

export default function TagPageClient({
  slug,
}: Props) {

  const [tag, setTag] =
    useState<Tag | null>(null)

  const [posts, setPosts] =
    useState<Post[]>([])

  const [loading, setLoading] =
    useState(true)

  useEffect(() => {

    const fetchTagPage = async () => {

      // current tag

      const {
        data: currentTag,
        error: tagError,
      } = await supabase
        .from("tags")
        .select(`
          id,
          name,
          name_ja,
          slug
        `)
        .eq("slug", slug)
        .single()

      if (tagError || !currentTag) {

        console.log(tagError)

        setLoading(false)

        return
      }

      setTag(currentTag)

      // posts with current tag

      const {
        data: postTagsData,
        error: postTagsError,
      } = await supabase
        .from("post_tags")
        .select(`
          posts (
            id,
            title,
            image_urls
          )
        `)
        .eq("tag_id", currentTag.id)

      if (postTagsError) {

        console.log(postTagsError)

        setLoading(false)

        return
      }

      const postIds =
        postTagsData
          ?.map((item: any) => item.posts?.id)
          .filter(Boolean) || []

      if (postIds.length === 0) {

        setPosts([])

        setLoading(false)

        return
      }

      // all tags for those posts

      const {
        data: relatedData,
        error: relatedError,
      } = await supabase
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

      if (relatedError) {

        console.log(relatedError)

        setLoading(false)

        return
      }

      // build post map

      const postMap = new Map<
        string,
        Post
      >()

      postTagsData.forEach((item: any) => {

        const post = item.posts

        if (!post) return

        postMap.set(post.id, {
          id: post.id,
          title: post.title,
          image_urls:
            post.image_urls || [],
          tags: [],
        })
      })

      relatedData?.forEach((item: any) => {

        const existingPost =
          postMap.get(item.post_id)

        if (
          !existingPost ||
          !item.tags
        ) return

        existingPost.tags.push(item.tags)
      })

      setPosts(
        Array.from(postMap.values())
      )

      setLoading(false)
    }

    fetchTagPage()

  }, [slug])

  // group by related tag

  const groupedPosts =
    useMemo<GroupedPosts[]>(() => {

      if (!tag) return []

      const groups = new Map<
        string,
        GroupedPosts
      >()

      posts.forEach((post) => {

        post.tags.forEach((relatedTag) => {

          // skip current tag

          if (
            relatedTag.slug === tag.slug
          ) return

          const existing =
            groups.get(
              relatedTag.slug
            )

          if (existing) {

            existing.posts.push(post)

          } else {

            groups.set(
              relatedTag.slug,
              {
                tag: relatedTag,
                posts: [post],
              }
            )
          }
        })
      })

      return Array.from(
        groups.values()
      ).sort((a, b) =>
        a.tag.name.localeCompare(
          b.tag.name
        )
      )

    }, [posts, tag])

  if (loading) {

    return (
      <main className="p-10 md:p-14 lg:p-16">
        Loading...
      </main>
    )
  }

  if (!tag) {

    return (
      <main className="p-10 md:p-14 lg:p-16">
        Tag not found
      </main>
    )
  }

  return (

    <main className="p-10 md:p-14 lg:p-16">

      {/* header */}

      <section className="max-w-4xl">

        <p
          className="
            type-label
            text-[11px]
            tracking-[0.12em]
            text-subtle
          "
        >
          TAG
        </p>

        <h1
          className="
            mt-8
            type-brand
            text-5xl
            md:text-6xl
            tracking-[0.1em]
          "
        >
          {tag.name.toUpperCase()}
        </h1>

        {tag.name_ja && (

          <p
            className="
              mt-4
              text-base
              tracking-[0.08em]
              text-muted
            "
          >
            {tag.name_ja}
          </p>

        )}

      </section>

      {/* grouped related tags */}

      <section className="mt-20 space-y-24">

        {groupedPosts.length === 0 && (

          <p className="text-sm text-muted">
            関連投稿はありません
          </p>

        )}

        {groupedPosts.map((group) => (

          <section
            key={group.tag.slug}
            className="space-y-8"
          >

            {/* related tag heading */}

            <div>

              <Link
                href={`/tags/${group.tag.slug}`}
                className="
                  inline-block
                  hover:opacity-60
                  transition-opacity
                "
              >

                <h2
                  className="
                    type-brand
                    text-3xl
                    tracking-[0.08em]
                  "
                >
                  {group.tag.name}
                </h2>

                {group.tag.name_ja && (

                  <p
                    className="
                      mt-2
                      text-sm
                      text-muted
                    "
                  >
                    {group.tag.name_ja}
                  </p>

                )}

              </Link>

            </div>

            {/* posts */}

            <div
              className="
                grid
                grid-cols-2
                md:grid-cols-3
                lg:grid-cols-4
                gap-6
              "
            >

              {group.posts.map((post) => (

                <Link
                  key={`${group.tag.slug}-${post.id}`}
                  href={`/posts/${post.id}`}
                  className="block group"
                >

                  <article className="space-y-3">

                    <div
                      className="
                        overflow-hidden
                        rounded-2xl
                        border
                        border-border
                        bg-surface
                      "
                    >

                      <img
                        src={
                          post.image_urls?.[0]
                        }
                        alt=""
                        className="
                          w-full
                          aspect-[4/5]
                          object-cover
                          transition-transform
                          duration-500
                          group-hover:scale-[1.02]
                        "
                      />

                    </div>

                    {post.title && (

                      <p
                        className="
                          text-sm
                          leading-relaxed
                        "
                      >
                        {post.title}
                      </p>

                    )}

                  </article>

                </Link>

              ))}

            </div>

          </section>

        ))}

      </section>

    </main>
  )
}