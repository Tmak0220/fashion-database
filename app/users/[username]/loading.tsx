import React from "react"

const UserLoading = () => {
  return (
    <main className="max-w-6xl mx-auto p-6 sm:p-10 md:p-14 lg:p-16 animate-pulse">
      <section className="w-full">
        <div className="flex items-center gap-5 sm:gap-8 md:gap-10">
          <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full bg-neutral-100 border border-neutral-200/60 flex-shrink-0" />

          <div className="flex-1 space-y-2.5">
            <div className="h-7 sm:h-9 bg-neutral-100 rounded-md w-48 sm:w-64" />
            <div className="h-4 sm:h-5 bg-neutral-100 rounded-md w-32 sm:w-40" />
          </div>
        </div>

        <div className="mt-8 grid grid-cols-2 sm:flex sm:flex-wrap sm:gap-10 border-t border-b sm:border-none border-neutral-100 divide-y sm:divide-y-0 divide-neutral-100">
          <div className="py-3 sm:py-0 text-center sm:text-left space-y-1.5 sm:w-20">
            <div className="h-6 sm:h-8 bg-neutral-100 rounded mx-auto sm:mx-0 w-8" />
            <div className="h-3 bg-neutral-100 rounded mx-auto sm:mx-0 w-12" />
          </div>
          <div className="py-3 sm:py-0 text-center sm:text-left space-y-1.5 sm:w-20">
            <div className="h-6 sm:h-8 bg-neutral-100 rounded mx-auto sm:mx-0 w-8" />
            <div className="h-3 bg-neutral-100 rounded mx-auto sm:mx-0 w-16" />
          </div>
          <div className="py-3 sm:py-0 text-center sm:text-left space-y-1.5 sm:w-20">
            <div className="h-6 sm:h-8 bg-neutral-100 rounded mx-auto sm:mx-0 w-8" />
            <div className="h-3 bg-neutral-100 rounded mx-auto sm:mx-0 w-16" />
          </div>
          <div className="py-3 sm:py-0 text-center sm:text-left space-y-1.5 sm:w-20">
            <div className="h-6 sm:h-8 bg-neutral-100 rounded mx-auto sm:mx-0 w-8" />
            <div className="h-3 bg-neutral-100 rounded mx-auto sm:mx-0 w-20" />
          </div>
        </div>

        <div className="mt-6 space-y-2">
          <div className="h-3.5 bg-neutral-100 rounded w-full max-w-md" />
          <div className="h-3.5 bg-neutral-100 rounded w-2/3" />
        </div>
      </section>

      <section className="mt-12 sm:mt-16 md:mt-20 border-t border-neutral-200/60 pt-8 sm:pt-10">
        <div className="space-y-1.5 mb-8">
          <div className="h-5 bg-neutral-100 rounded w-40" />
          <div className="h-3 bg-neutral-100 rounded w-24" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-12">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="bg-neutral-100 rounded-xl sm:rounded-2xl border border-neutral-200/60 aspect-[4/5] w-full" />
              <div className="h-4 bg-neutral-100 rounded w-5/6 mx-0.5 sm:px-1" />
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}

export default UserLoading