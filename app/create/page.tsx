import CreatePostForm from "@/components/CreatePostForm"

export default function CreatePage() {

  return (
    <main className="max-w-3xl p-10 md:p-14 lg:p-16">

      <p
        className="type-label text-sm uppercase text-subtle"
        style={{
          letterSpacing: "0.12em",
          paddingRight: "0.12em",
        }}
      >
        Create
      </p>

      <h1
        className="mt-6 type-brand text-5xl"
        style={{
          letterSpacing: "0.08em",
          paddingRight: "0.08em",
        }}
      >
        CREATE POST
      </h1>

      <div className="mt-12">
        <CreatePostForm />
      </div>

    </main>
  )
}