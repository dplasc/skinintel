"use client";

import { useState } from "react";

export default function SolutionPage() {
  const [showInterestMessage, setShowInterestMessage] = useState(false);
  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [consent, setConsent] = useState(false);
  const handleInterestSubmit = async () => {
    if (!consent) {
      setErrorMessage("Potrebno je dati privolu");
      return;
    }
    if (!email || !email.includes("@")) {
      setErrorMessage("Unesi ispravan email");
      return;
    }
    setErrorMessage("");
    try {
      const res = await fetch("/api/interest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email })
      });

      if (!res.ok) {
        setErrorMessage("Došlo je do greške. Pokušaj ponovno.");
        return;
      }

      if (res.ok) {
        setShowInterestMessage(true);
      }
    } catch (err) {
      console.error("Interest submit error", err);
      setErrorMessage("Došlo je do greške. Pokušaj ponovno.");
    }
  };
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
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-6 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-400 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
        />
        <label className="mt-4 flex items-start gap-2 text-sm text-neutral-600">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
          />
          <span>
            Slažem se da se moj email koristi za slanje informacija o proizvodu.
          </span>
        </label>
        <button
          type="button"
          onClick={handleInterestSubmit}
          className="mt-3 w-full rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
        >
          Želim više informacija
        </button>
        {errorMessage && (
          <p className="mt-2 text-sm text-red-600">
            {errorMessage}
          </p>
        )}
        {showInterestMessage && (
          <p className="mt-3 text-sm text-green-600">
            Hvala na interesu — uskoro ćemo imati više informacija za tebe.
          </p>
        )}
      </div>
    </main>
  );
}
