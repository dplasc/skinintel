import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-6 dark:bg-neutral-950">
      <div className="mx-auto w-full max-w-2xl">
        <div className="flex flex-col items-center rounded-2xl border border-neutral-200/80 bg-white px-8 py-10 text-center shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
          <h1 className="text-4xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
          SkinIntel
          </h1>
          <p className="mt-4 max-w-xl text-base text-neutral-600 dark:text-neutral-300">
            AI analiza kože za bolje razumijevanje i poboljšanje stanja tvoje kože.
          </p>
          <p className="mt-2 max-w-lg text-sm text-neutral-500 dark:text-neutral-400">
            Edukativni, nemedicinski uvidi na temelju fotografije kože i tvog unosa.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4">
            <Link
              href="/dashboard"
              className="rounded-md bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
            >
              Pokreni analizu
            </Link>
            <Link
              href="/auth/login"
              className="text-sm text-neutral-600 underline-offset-4 transition hover:underline dark:text-neutral-300"
            >
              Prijava
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
