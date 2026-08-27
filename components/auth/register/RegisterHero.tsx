export default function RegisterHero() {
  return (
    <section className="hidden md:flex w-1/2 bg-gradient-to-br from-indigo-600 to-indigo-800 p-16 flex-col justify-between text-white">

      <div>

        {/* LOGO */}

        <div className="flex items-center gap-3 mb-12">

          <span className="material-symbols-outlined text-4xl">
            menu_book
          </span>

          <h1 className="text-2xl font-black tracking-tight">
            The Academic Curator
          </h1>

        </div>

        <h2 className="text-5xl font-bold leading-tight mb-6 text-white">
          Master your academic journey through curated learning.
        </h2>

        <p className="text-white/90 text-lg max-w-md">
          Join thousands of students and faculty members in the world&apos;s most
          sophisticated educational publication environment.
        </p>

      </div>

    </section>
  )
}