import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { supabase } from "@/lib/supabase"
import DesignerPageClient from "./DesignerPageClient"

type Props = {
  params: Promise<{
    region: string
    country: string
    slug: string
  }>
}

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const {
    region,
    country,
    slug,
  } = await params

  const { data: designer } =
    await supabase
      .from("designers")
      .select(`
        name,
        name_ja,
        description,
        country_name_ja
      `)
      .eq("slug", slug)
      .single()

  if (!designer) {
    return {
      title: "Designer Not Found",
    }
  }

  const title = designer.name_ja
    ? `${designer.name_ja} (${designer.name}) | Fashion Database`
    : `${designer.name} | Fashion Database`

  const description =
    designer.description
      ? designer.description.slice(0, 120)
      : `${designer.country_name_ja}を拠点とするデザイナー。コレクションやアーカイブを閲覧できます。`

  return {
    title,
    description,
    alternates: {
      canonical: `https://fashdb.com/designers/${region}/${country}/${slug}`,
    },
  }
}

export default async function Page({
  params,
}: Props) {
  const { slug } = await params

  const { data: designer } =
    await supabase
      .from("designers")
      .select("*")
      .eq("slug", slug)
      .single()

  if (!designer) {
    notFound()
  }

  const { data: relatedDesigners } =
    await supabase
      .from("designers")
      .select(`
        id,
        name,
        name_ja,
        slug,
        region_slug,
        country_slug
      `)
      .eq(
        "country_slug",
        designer.country_slug
      )
      .neq(
        "slug",
        designer.slug
      )

  const shuffled =
    (relatedDesigners || [])
      .sort(() => 0.5 - Math.random())

  const selectedDesigners =
    shuffled.slice(0, 4)

  return (
    <DesignerPageClient
      designer={designer}
      relatedDesigners={selectedDesigners}
    />
  )
}