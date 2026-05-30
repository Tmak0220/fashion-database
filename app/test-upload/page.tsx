import ImageUpload from "@/components/ImageUpload"

export default function TestUploadPage() {

  return (
    <main className="p-10">

      <h1
        className="type-brand text-5xl"
        style={{
          letterSpacing: "0.08em",
          paddingRight: "0.08em",
        }}
      >
        TEST UPLOAD
      </h1>

      <div className="mt-10">
        <ImageUpload />
      </div>

    </main>
  )
}