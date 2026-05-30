import type { Metadata } from "next"

import DesignerPageClient from "./DesignerPageClient"

import { supabase } from "@/lib/supabase"

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

  const { slug } = await params

  const { data: designer } =
    await supabase
      .from("designers")
      .select(`
        name,
        name_ja,
        description
      `)
      .eq("slug", slug)
      .single()

  if (!designer) {

    return {
      title: "Designer Not Found",
    }
  }

  const title =
    designer.name_ja
      ? `${designer.name_ja} (${designer.name})`
      : designer.name

  const description =
    designer.description
      ? designer.description.slice(0, 120)
      : `${title} のアーカイブページ`

  return {

    title,

    description,

    openGraph: {

      title,

      description,

      type: "website",
    },

    twitter: {

      card: "summary_large_image",

      title,

      description,
    },
  }
}

export default async function Page({
  params,
}: Props) {

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
        name_ja
      `)
      .eq("slug", slug)
      .single()

  const jsonLd = {

    "@context": "https://schema.org",

    "@type": "BreadcrumbList",

    itemListElement: [

      {
        "@type": "ListItem",
        position: 1,
        name: "ファッションデータベース",
        item: "https://your-domain.com",
      },

      {
        "@type": "ListItem",
        position: 2,
        name: "デザイナー",
        item: "https://your-domain.com/designers",
      },

      {
        "@type": "ListItem",
        position: 3,
        name:
          designer?.name_ja ||
          designer?.name ||
          "Designer",
        item:
          `https://your-domain.com/designer/${region}/${country}/${slug}`,
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd),
        }}
      />

      <DesignerPageClient />
    </>
  )
}