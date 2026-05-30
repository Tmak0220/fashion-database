"use client" // マウスホバーなどのインタラクション表現や、将来的な状態管理のために推奨

import Link from "next/link"

type Brand = {
  id: number
  slug: string
  name: string
  region_slug: string
  country_slug: string
}

export default function BrandButton({
  brand,
}: {
  brand: Brand
}) {
  return (
    <Link
      href={`/brands/${brand.region_slug}/${brand.country_slug}/${brand.slug}`}
      className="
        inline-block
        border
        border-border
        rounded-xl
        px-6
        py-4
        bg-surface
        text-foreground
        hover:bg-foreground
        hover:text-background
        transition-colors
        duration-300
      "
    >
      <span 
        className="type-ui text-xs font-medium tracking-[0.12em]"
        style={{
          paddingRight: "0.12em" // レタースペースを広げた分、右側にほんの少し余白を足して中央揃えを完璧にする
        }}
      >
        {brand.name.toUpperCase()} {/* ブランド名をすべて自動で大文字に変換 */}
      </span>
    </Link>
  )
}