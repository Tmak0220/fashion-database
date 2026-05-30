import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { supabase } from "@/lib/supabase"
import BrandButton from "@/components/BrandButton"
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
  const { data: countryData } = await supabase
    .from("countries")
    .select("name, name_ja")
    .eq("slug", country)
    .single()

  const countryName = countryData ? (countryData.name_ja || countryData.name) : "国"

  return {
    title: `${countryName}のブランド一覧 | Fashion Database`,
    description: `ファッションデータベースに登録されているブランドの中から、${countryName}を拠点とするブランドのアーカイブを閲覧できます。`,
    alternates: {
      canonical: `https://fashdb.com/brands/${region}/${country}`,
    },
  }
}

export default async function CountryPage({ params }: Props) {
  const { region, country } = await params
  const { data: countryData } = await supabase
    .from("countries")
    .select("*")
    .eq("slug", country)
    .single()

  if (!countryData) {
    notFound()
  }

  const { data: brands } = await supabase
    .from("brands")
    .select("*")
    .eq("region_slug", region)
    .eq("country_slug", country)
    .order("name", { ascending: true })

  return (
    <main className="p-6 sm:p-10 md:p-14 lg:p-16">
      <Breadcrumb
        items={[
          { label: "ファッションデータベース", href: "/" },
          { label: "ブランド", href: "/brands" },
          { label: countryData.region_name_ja, href: `/brands/${countryData.region_slug}` },
          { label: countryData.name_ja || countryData.name },
        ]}
      />

      <div className="mt-8 sm:mt-10">
        <h1 className="type-brand text-4xl sm:text-5xl md:text-6xl tracking-[0.18em] pr-[0.18em]">
          {countryData.name}
        </h1>

        {countryData.name_ja && (
          <p className="mt-3 text-lg sm:text-xl tracking-[0.04em] text-muted">
            {countryData.name_ja}
          </p>
        )}

        {countryData.history && (
          <p className="mt-6 max-w-3xl text-[14px] sm:text-[15px] leading-7 sm:leading-8 text-muted whitespace-pre-line">
            {countryData.history}
          </p>
        )}

        <section className="mt-12 sm:mt-16">
          <SectionHeading
            title="Brands"
            titleJa="ブランド"
            className="mb-6"
          />
          <div className="flex flex-wrap gap-3 sm:gap-4">
            {brands?.map((brand) => (
              <BrandButton
                key={brand.id}
                brand={brand}
              />
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}