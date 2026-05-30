"use client"

import { useState } from "react"

export default function ImageUpload() {

  const [uploading, setUploading] = useState(false)

  const [imageUrl, setImageUrl] = useState("")

  const handleUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {

    const file = e.target.files?.[0]

    if (!file) return

    setUploading(true)

    const formData = new FormData()

    formData.append("file", file)

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    })

    const data = await res.json()

    setUploading(false)

    if (!res.ok) {
      alert(data.error)
      return
    }

    setImageUrl(data.url)
  }

  return (
    <div className="space-y-6">

      <input
        type="file"
        accept="image/*"
        onChange={handleUpload}
      />

      {uploading && (
        <p>Uploading...</p>
      )}

      {imageUrl && (
        <img
          src={imageUrl}
          alt=""
          className="
            w-64
            rounded-2xl
            border
            border-border
          "
        />
      )}

    </div>
  )
}