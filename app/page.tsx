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
            AI-powered skin analysis for understanding and improving your skin.
          </p>
          <p className="mt-2 max-w-lg text-sm text-neutral-500 dark:text-neutral-400">
            Educational, non-medical insights based on your skin photo and input.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4">
            <Link
              href="/dashboard"
              className="rounded-md bg-neutral-900 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
            >
              Start Scan
            </Link>
            <Link
              href="/auth/login"
              className="text-sm text-neutral-600 underline-offset-4 transition hover:underline dark:text-neutral-300"
            >
              Login
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
