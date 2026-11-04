"use client"

import Image from "next/image"
import { useState } from "react"

type PostImageProps = {
  src: string
  alt: string
  priority?: boolean
}

export default function PostImage({ src, alt, priority = false }: PostImageProps) {
  const [aspectRatio, setAspectRatio] = useState<number | null>(null)

  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl border border-border bg-surface"
      style={{ aspectRatio: aspectRatio ?? "4 / 5" }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 1024px) 100vw, 50vw"
        priority={priority}
        className="object-contain"
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
