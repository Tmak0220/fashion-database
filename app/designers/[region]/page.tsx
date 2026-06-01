import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { supabase } from "@/lib/supabase"
import SectionHeading from "@/components/SectionHeading"

type Props = {
  params: Promise<{
    region: string
  }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { region } = await params

  const { data: regionData } = await supabase
    .from("regions")
    .select("name, name_ja")
    .eq("slug", region)
    .single()

  const regionName = regionData
    ? (regionData.name_ja || regionData.name)
    : "地域"

  return {
    title: `${regionName}のデザイナー一覧 | Fashion Database`,
    description: `ファッションデータベースに登録されているデザイナーの中から、${regionName}に属する国別のアーカイブを閲覧できます。`,
    alternates: {
      canonical: `https://fashdb.com/designers/${region}`,
    },
  }
}

export default async function DesignersRegionPage({ params }: Props) {
  const { region } = await params

  const { data: regionData } = await supabase
    .from("regions")
    .select("*")
    .eq("slug", region)
    .single()

  if (!regionData) {
    notFound()
  }

  const { data: countries } = await supabase
    .from("designers")
    .select("country_slug, country_name_ja")
    .eq("region_slug", region)

  const uniqueCountries = Array.from(
    new Map(
      (countries ?? []).map((country) => [
        country.country_slug,
        country,
      ])
    ).values()
  ).sort((a, b) =>
    a.country_name_ja.localeCompare(b.country_name_ja, "ja")
  )

  return (
    <main className="p-6 sm:p-10 md:p-14 lg:p-16">
      <nav className="flex flex-wrap items-center gap-2 text-sm text-subtle">
        <Link href="/" className="hover:text-black transition-colors duration-300">
          ファッションデータベース
        </Link>
        <span>＞</span>
        <Link href="/designers" className="hover:text-black transition-colors duration-300">
          デザイナー
        </Link>
        <span>＞</span>
        <span className="text-black">
          {regionData.name_ja || regionData.name}
        </span>
      </nav>

      <h1 className="mt-8 type-brand text-4xl sm:text-5xl md:text-6xl tracking-[0.18em] pr-[0.18em]">
        {regionData.name}
      </h1>

      {regionData.name_ja && (
        <p className="mt-3 text-lg sm:text-xl tracking-[0.04em] text-muted">
          {regionData.name_ja}
        </p>
      )}

      {regionData.history && (
        <p className="mt-6 max-w-3xl text-[14px] sm:text-[15px] leading-7 sm:leading-8 text-muted whitespace-pre-line">
          {regionData.history}
        </p>
      )}

      <section className="mt-12 sm:mt-16">
        <SectionHeading
          title="Countries"
          titleJa="国"
          className="mb-6"
        />

        <div className="flex flex-wrap gap-3 sm:gap-4">
          {uniqueCountries.map((country) => (
            <Link
              key={country.country_slug}
              href={`/designers/${region}/${country.country_slug}`}
              className="group block border border-neutral-300 rounded-xl px-5 sm:px-6 py-3.5 sm:py-4 bg-white transition-all duration-300 md:hover:bg-black md:hover:text-white md:hover:border-black active:bg-neutral-100"
            >
              <span className="type-label text-sm tracking-[0.08em] font-semibold group-hover:text-inherit">
                {country.country_name_ja}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}