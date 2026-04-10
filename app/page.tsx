import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-6 dark:bg-neutral-950">
      <div className="mx-auto flex w-full max-w-xl flex-col items-center text-center">
        <h1 className="text-3xl font-semibold text-neutral-900 dark:text-neutral-100">
          SkinIntel
        </h1>
        <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-300">
          AI-powered skin analysis for understanding and improving your skin.
        </p>
        <Link
          href="/dashboard"
          className="mt-8 rounded-md bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
        >
          Start Scan
        </Link>
        <Link
          href="/auth/login"
          className="mt-4 text-sm text-neutral-600 underline-offset-4 transition hover:underline dark:text-neutral-300"
        >
          Login
        </Link>
      </div>
    </main>
  );
}
