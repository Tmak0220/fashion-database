import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { supabase } from "@/lib/supabase"
import DesignerButton from "@/components/DesignerButton"
import SectionHeading from "@/components/SectionHeading"
import Breadcrumb from "@/components/Breadcrumb"

type Props = {
  params: Promise<{
    region: string
    country: string
  }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { region, country } = await params

  const { data: designer } = await supabase
    .from("designers")
    .select("country_name_ja")
    .eq("region_slug", region)
    .eq("country_slug", country)
    .limit(1)
    .single()

  const countryName = designer?.country_name_ja || "国"

  return {
    title: `${countryName}のデザイナー一覧 | Fashion Database`,
    description: `ファッションデータベースに登録されているデザイナーの中から、${countryName}を拠点とするデザイナーのアーカイブを閲覧できます。`,
    alternates: {
      canonical: `https://fashdb.com/designers/${region}/${country}`,
    },
  }
}

export default async function CountryPage({ params }: Props) {
  const { region, country } = await params

  const { data: designers } = await supabase
    .from("designers")
    .select("*")
    .eq("region_slug", region)
    .eq("country_slug", country)
    .order("name", { ascending: true })

  if (!designers || designers.length === 0) {
    notFound()
  }

  const countryData = designers[0]

  return (
    <main className="p-6 sm:p-10 md:p-14 lg:p-16">
      <Breadcrumb
        items={[
          { label: "ファッションデータベース", href: "/" },
          { label: "デザイナー", href: "/designers" },
          {
            label: countryData.region_name_ja,
            href: `/designers/${countryData.region_slug}`,
          },
          { label: countryData.country_name_ja },
        ]}
      />

      <div className="mt-8 sm:mt-10">
        <h1 className="type-brand text-4xl sm:text-5xl md:text-6xl tracking-[0.18em] pr-[0.18em]">
          {countryData.country_name_ja}
        </h1>

        <section className="mt-12 sm:mt-16">
          <SectionHeading
            title="Designers"
            titleJa="デザイナー"
            className="mb-6"
          />

          <div className="flex flex-wrap gap-3 sm:gap-4">
            {designers.map((designer) => (
              <DesignerButton
                key={designer.id}
                designer={designer}
              />
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}