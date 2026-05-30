import type { Metadata } from "next"
import { supabase } from "@/lib/supabase"
import LikesPageClient from "./LikesPageClient"

type Props = {
  params: Promise<{
    id: string
  }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const { data: post } = await supabase
    .from("posts")
    .select("title")
    .eq("id", id)
    .single()

  const title = post?.title ? `「${post.title}」にいいねしたユーザー | Fashion Database` : "Likes | Fashion Database"
  return {
    title,
    description: "この投稿にいいね！したユーザーの一覧です。",
  }
}

export default async function Page({ params }: Props) {
  const { id } = await params
  return <LikesPageClient id={id} />
}