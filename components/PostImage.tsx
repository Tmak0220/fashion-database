"use client"

import Image from "next/image"
import { useState } from "react"

type PostImageProps = {
  src: string
  alt: string
  preload?: boolean
}

export default function PostImage({ src, alt, preload = false }: PostImageProps) {
  const [aspectRatio, setAspectRatio] = useState<number | null>(null)

  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl"
      style={{ aspectRatio: aspectRatio ?? "4 / 5" }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 1024px) 100vw, 50vw"
        preload={preload}
        className="object-cover"
        onLoad={(event) => {
          const image = event.currentTarget
          if (image.naturalWidth > 0 && image.naturalHeight > 0) {
            setAspectRatio(image.naturalWidth / image.naturalHeight)
          }
        }}
      />
    </div>
  )
}
