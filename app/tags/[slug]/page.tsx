import TagPageClient from "./TagPageClient"
import type { Metadata } from "next"

type Props = {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const tagName = decodeURIComponent(slug)
  return {
    title: `#${tagName} - FASHION DATABASE`,
  }
}

export default async function TagPage({ params }: Props) {
  const { slug } = await params

  return <TagPageClient slug={slug} />
}