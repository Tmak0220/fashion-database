import type { Metadata } from "next"
import { supabase } from "@/lib/supabase"
import PostPageClient from "./PostPageClient"

type Props = {
  params: Promise<{
    id: string
  }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const { data: post } = await supabase
    .from("posts")
    .select("title, description")
    .eq("id", id)
    .single()

  const title = post?.title ? `${post.title} | Fashion Database` : "Post Detail | Fashion Database"
  const description = post?.description ? post.description.slice(0, 120) : "ファッションデータベースのアーカイブ投稿詳細ページです。"

  return {
    title,
    description,
  }
}

export default async function Page({ params }: Props) {
  const { id } = await params
  return <PostPageClient id={id} />
}