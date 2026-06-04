import type { Metadata } from "next"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import SectionHeading from "@/components/SectionHeading"

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Brands | Fashion Database",
    description: "ファッションデータベースに登録されているブランドを、地域・国別に探すことができます。",
    alternates: {
      canonical: "https://fashdb.com/brands",
    },
  }
}

export default async function BrandsPage() {
  const { data: regions } = await supabase
    .from("regions")
    .select("*")
    .order("name", { ascending: true })

  return (
    <main className="p-6 sm:p-10 md:p-14 lg:p-16">
      <nav className="flex flex-wrap items-center gap-2 text-sm text-subtle">
        <Link href="/" className="hover:text-black transition-colors duration-300">
          ファッションデータベース
        </Link>
        <span>＞</span>
        <span className="text-black">ブランド</span>
      </nav>

      <h1 className="mt-8 type-brand text-4xl sm:text-5xl md:text-6xl tracking-[0.18em] pr-[0.18em]">
        Brands
      </h1>

      <p className="mt-3 text-lg sm:text-xl tracking-[0.04em] text-muted">
        ブランド
      </p>

      <section className="mt-12 sm:mt-16">
        <SectionHeading
          title="Regions"
          titleJa="地域"
          className="mb-6"
        />
        <div className="flex flex-wrap gap-3 sm:gap-4">
          {regions?.map((region) => (
            <Link
              key={region.id}
              href={`/brands/${region.slug}`}
              className="group block border border-neutral-300 rounded-xl px-5 sm:px-6 py-3.5 sm:py-4 bg-white transition-all duration-300 md:hover:bg-black md:hover:text-white md:hover:border-black active:bg-neutral-100"
            >
              <p className="type-label text-sm tracking-[0.08em] font-semibold uppercase group-hover:text-inherit">
                {region.name}
              </p>
              {region.name_ja && (
                <p className="type-label-ja mt-1 text-xs text-muted group-hover:text-inherit opacity-80">
                  {region.name_ja}
                </p>
              )}
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}