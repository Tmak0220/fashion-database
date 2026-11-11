import type { Metadata } from "next"
import { localizedAlternates } from "@/lib/locale-server"

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "タグから探す",
    description: "カテゴリーや素材などのタグからファッション投稿を探せます。",
    alternates: await localizedAlternates("/tags"),
  }
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
