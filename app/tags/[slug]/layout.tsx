import { supabase } from "@/lib/supabase"

type Props = { children: React.ReactNode; params: Promise<{ slug: string }> }

export default async function Layout({ children, params }: Props) {
  const { slug } = await params
  const { data } = await supabase.from("tags").select("name, name_ja").eq("slug", slug).maybeSingle()
  const name = data?.name_ja || data?.name || decodeURIComponent(slug)
  return (
    <>
      <h1 className="sr-only">{name}のファッション投稿</h1>
      {children}
    </>
  )
}
