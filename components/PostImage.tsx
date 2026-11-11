"use client"

import Image from "next/image"

type PostImageProps = {
  src: string
  alt: string
  preload?: boolean
}

export default function PostImage({ src, alt, preload = false }: PostImageProps) {
  return (
    <div className="relative w-full aspect-[4/5] overflow-hidden rounded-2xl bg-surface">
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 1024px) 100vw, 50vw"
        preload={preload}
        className="object-contain"
      />
    </div>
  )
}
