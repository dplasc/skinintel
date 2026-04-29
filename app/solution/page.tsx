"use client";

import { useState } from "react";

export default function SolutionPage() {
  const [showInterestMessage, setShowInterestMessage] = useState(false);
  return (
    <main className="mx-auto max-w-3xl px-6 py-12 text-neutral-900 dark:text-neutral-100">
      <h1 className="text-3xl font-semibold tracking-tight">
        Jednostavnije rješenje za tvoju rutinu
      </h1>

      <div className="mt-8 space-y-5 text-sm leading-6 text-neutral-700 dark:text-neutral-300">
        <p>
          Ova stranica predstavlja ideju formulacije koja kombinira ključne sastojke iz tvoje
          analize u jednom proizvodu.
        </p>
        <p>Cilj je pojednostaviti rutinu i fokusirati se na uzrok problema.</p>
        <p className="text-neutral-500 dark:text-neutral-400">Uskoro više detalja.</p>

        <section>
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            Što ovo rješenje radi
          </h2>
          <p className="mt-2">
            Ovakva formulacija može pomoći u regulaciji sebuma, smanjenju nepravilnosti i jačanju
            kožne barijere kroz kombinaciju aktivnih i umirujućih sastojaka.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            Zašto je drugačije
          </h2>
          <p className="mt-2">
            Umjesto korištenja više odvojenih proizvoda, ovaj pristup fokusira se na jednostavniju
            rutinu s pažljivo odabranim sastojcima u jednoj formulaciji.
          </p>
        </section>

        <input
          type="email"
          placeholder="Unesi email za više informacija"
          className="mt-6 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-400 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
        />
        <button
          type="button"
          onClick={() => setShowInterestMessage(true)}
          className="mt-3 w-full rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
        >
          Želim više informacija
        </button>
        {showInterestMessage && (
          <p className="mt-3 text-sm text-green-600">
            Hvala na interesu — uskoro ćemo imati više informacija za tebe.
          </p>
        )}
      </div>
    </main>
  );
}
