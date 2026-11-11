import type { Metadata } from "next"
import { supabase } from "@/lib/supabase"
import { localizedAlternates } from "@/lib/locale-server"

type Props = { children: React.ReactNode; params: Promise<{ brand: string }> }

export async function generateMetadata({ params }: Omit<Props, "children">): Promise<Metadata> {
  const { brand } = await params
  const { data } = await supabase.from("brands").select("name, name_ja").eq("slug", brand).maybeSingle()
  const name = data?.name_ja || data?.name || brand.replaceAll("-", " ")
  const title = `${name}のコレクションアーカイブ`
  const description = `${name}のシーズン別コレクションと投稿アイテムをまとめたファッションアーカイブです。`
  return {
    title,
    description,
    alternates: await localizedAlternates(`/collections/${brand}`),
    openGraph: { title, description, type: "website" },
    twitter: { card: "summary", title, description },
  }
}

export default function Layout({ children }: Props) {
  return children
}
