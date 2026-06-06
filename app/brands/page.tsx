export const dynamic = "force-dynamic"

import type { Metadata } from "next"
import { supabase } from "@/lib/supabase"

import PageLayout from "@/components/PageLayout"
import IntroSection from "@/components/IntroSection"
import CardSection from "@/components/CardSection"

import { useSiteContent } from "@/lib/useSiteContent"

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Brands | Fashion Database",
    description:
      "ファッションデータベースに登録されているブランドを、地域・国別に探すことができます。",
    alternates: {
      canonical: "https://fashdb.com/brands",
    },
  }
}

export default async function BrandsPage() {
  const [{ data: regions }, intro] = await Promise.all([
    supabase
      .from("regions")
      .select("*")
      .order("name", { ascending: true }),

    useSiteContent("brands", {
      fallback: "世界のファッションの歴史を準備中です。",
    }),
  ])

  return (
    <PageLayout
      title="Brands"
      subtitle="ブランド"
    >
      <IntroSection
        title="世界のファッションの歴史"
        content={intro?.content}
        isVisible={intro?.is_visible}
      />

      <CardSection
        title="Regions"
        titleJa="地域"
        items={regions}
        basePath="/brands"
      />
    </PageLayout>
  )
}