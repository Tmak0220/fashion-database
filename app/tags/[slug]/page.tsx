import TagPageClient from "./TagPageClient"

type Props = {
  params: Promise<{
    slug: string
  }>
}

export default async function TagPage({
  params,
}: Props) {

  const { slug } = await params

  return (
    <TagPageClient slug={slug} />
  )
}