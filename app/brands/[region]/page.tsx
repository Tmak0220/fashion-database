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

  const regionName = regionData ? (regionData.name_ja || regionData.name) : "地域"

  return {
    title: `${regionName}のブランド一覧 | Fashion Database`,
    description: `ファッションデータベースに登録されているブランドの中から、${regionName}に属する国別のアーカイブを閲覧できます。`,
    alternates: {
      canonical: `https://fashdb.com/brands/${region}`,
    },
  }
}

export default async function RegionPage({ params }: Props) {
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
    .from("countries")
    .select("*")
    .eq("region_slug", region)
    .order("name", { ascending: true })

  return (
    <main className="p-6 sm:p-10 md:p-14 lg:p-16">
      <nav className="flex flex-wrap items-center gap-2 text-sm text-subtle">
        <Link href="/" className="hover:text-black transition-colors duration-300">
          ファッションデータベース
        </Link>
        <span>＞</span>
        <Link href="/brands" className="hover:text-black transition-colors duration-300">
          ブランド
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
          {countries?.map((country) => (
            <Link
              key={country.id}
              href={`/brands/${region}/${country.slug}`}
              className="group flex flex-col items-center border border-neutral-300 rounded-xl px-5 sm:px-6 py-3.5 sm:py-4 bg-white transition-all duration-300 md:hover:bg-black md:hover:text-white md:hover:border-black active:bg-neutral-100"
            >
              <p className="type-label text-sm tracking-[0.08em] font-semibold uppercase text-center group-hover:text-inherit">
                {country.name}
              </p>

              {country.name_ja && (
                <p className="mt-1 text-xs text-center text-muted group-hover:text-inherit opacity-80">
                  {country.name_ja}
                </p>
              )}
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}