import imageCompression from "browser-image-compression"

export async function compressImage(file: File): Promise<File> {
  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1200,
    useWebWorker: true,
  }

  try {
    const compressedFile = await imageCompression(file, options)

    const MAX_SIZE = 5 * 1024 * 1024 // 5MB

    if (compressedFile.size > MAX_SIZE) {
      throw new Error(
        "画像サイズが大きすぎます。5MB以下の画像を選択してください。"
      )
    }

    return compressedFile
  } catch (error) {
    console.error("画像圧縮エラー:", error)

    if (error instanceof Error) {
      throw error
    }

    throw new Error(
      "画像の圧縮に失敗しました。別の画像をお試しください。"
    )
  }
}