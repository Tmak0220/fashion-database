import type { Metadata } from "next"
import { supabase } from "@/lib/supabase"
import PostPageClient from "./PostPageClient"

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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id: paramId } = await params
  const actualId = extractUuid(paramId)

  const { data: post } = await supabase
    .from("posts")
    .select("title, description")
    .eq("id", actualId)
    .single()

  const title = post?.title ? `${post.title} | MEMBER` : "Post Detail | MEMBER"
  const description = post?.description ? post.description.slice(0, 120) : "ファッションデータベースのアーカイブ投稿詳細ページです。"

  return {
    title,
    description,
  }
}

export default async function Page({ params }: Props) {
  const { id: paramId } = await params
  const actualId = extractUuid(paramId)

  return <PostPageClient id={actualId} />
}