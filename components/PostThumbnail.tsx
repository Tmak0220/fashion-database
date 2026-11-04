"use client"

import Image from "next/image"
import { useState } from "react"

type PostThumbnailProps = {
  src: string
  alt?: string
  sizes: string
}

const frameRatio = 4 / 5

export default function PostThumbnail({
  src,
  alt = "",
  sizes,
}: PostThumbnailProps) {
  const [imageRatio, setImageRatio] = useState<number | null>(null)
  const isWiderThanFrame = imageRatio !== null && imageRatio > frameRatio

  const imageFrameStyle = imageRatio === null
    ? { width: "100%", height: "100%" }
    : isWiderThanFrame
      ? { width: "100%", height: `${(frameRatio / imageRatio) * 100}%` }
      : { width: `${(imageRatio / frameRatio) * 100}%`, height: "100%" }

  return (
    <div className="relative w-full aspect-[4/5]">
      <div
        className={`absolute left-1/2 top-1/2 overflow-hidden rounded-2xl -translate-x-1/2 -translate-y-1/2 transition-opacity duration-300 group-hover:opacity-90 ${
          imageRatio === null ? "opacity-0" : "opacity-100"
        }`}
        style={imageFrameStyle}
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          className="object-cover"
          onLoad={(event) => {
            const image = event.currentTarget
            if (image.naturalWidth > 0 && image.naturalHeight > 0) {
              setImageRatio(image.naturalWidth / image.naturalHeight)
            }
          }}
        />
      </div>
    </div>
  )
}
