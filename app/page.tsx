import Link from "next/link";

const steps = [
  {
    n: "1",
    title: "Učitaj fotografiju",
    desc: "Dodaj jasnu fotografiju područja kože koje želiš bolje razumjeti.",
  },
  {
    n: "2",
    title: "Opiši stanje kože",
    desc: "Ukratko opiši simptome, promjene ili proizvode koje koristiš.",
  },
  {
    n: "3",
    title: "Dobij personalizirane preporuke",
    desc: "Primi edukativnu analizu i smjernice prilagođene tvojoj koži.",
  },
];

const benefits = [
  {
    title: "Edukativan pristup",
    desc: "Razumljiva objašnjenja koja ti pomažu shvatiti stanje kože, bez medicinskog žargona.",
  },
  {
    title: "Praćenje napretka",
    desc: "Spremaj analize i uspoređuj promjene svoje kože kroz vrijeme.",
  },
  {
    title: "Privatnost podataka",
    desc: "Tvoje fotografije i podaci ostaju privatni i pod tvojom kontrolom.",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#FBF6F0] dark:bg-neutral-950">
      {/* SECTION 1 — HERO */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 dark:opacity-50"
          style={{
            background:
              "radial-gradient(120% 120% at 50% 0%, #FBF4EC 0%, rgba(251,244,236,0) 60%), radial-gradient(80% 80% at 85% 8%, rgba(217,115,78,0.12) 0%, rgba(217,115,78,0) 50%), radial-gradient(70% 70% at 10% 30%, rgba(243,201,179,0.20) 0%, rgba(243,201,179,0) 55%)",
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-[#F3C9B3]/30 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-24 top-40 h-72 w-72 rounded-full bg-[#D9734E]/10 blur-3xl"
        />

        <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-6 py-14 sm:py-24 lg:grid-cols-2 lg:gap-16 lg:py-32">
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#E7CDBC] bg-[#FBF6F0]/80 px-4 py-1.5 shadow-[0_1px_2px_rgba(43,42,40,0.04)] backdrop-blur-sm dark:border-neutral-700 dark:bg-neutral-800/70">
              <span className="h-1.5 w-1.5 rounded-full bg-[#D9734E]" />
              <span className="bg-gradient-to-r from-[#D9734E] to-[#E0976F] bg-clip-text text-[11px] font-semibold uppercase tracking-[0.32em] text-transparent">
                AI analiza kože
              </span>
            </span>
            <h1 className="mt-8 text-4xl font-semibold leading-[1.08] tracking-tight text-[#2B2A28] sm:text-6xl dark:text-neutral-50">
              Što tvoja koža pokušava reći?
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[#6E6A63] sm:text-xl dark:text-neutral-300">
              Učitaj fotografiju kože i dobij edukativnu AI analizu s jasnim preporukama za njegu.
            </p>
            <div className="mt-10 flex w-full flex-col items-center gap-4 sm:w-auto sm:flex-row">
              <Link
                href="/dashboard"
                className="inline-flex w-full items-center justify-center rounded-2xl bg-[#D9734E] px-8 py-3.5 text-sm font-semibold text-white shadow-[0_2px_12px_rgba(217,115,78,0.28)] hover:bg-[#C45F3D] sm:w-auto"
              >
                Pokreni besplatnu analizu
              </Link>
              <Link
                href="/auth/login"
                className="inline-flex w-full items-center justify-center rounded-2xl border border-[#ECE0D4] bg-[#FBF4EC] px-8 py-3.5 text-sm font-semibold text-[#2B2A28] hover:bg-[#F7DECF] sm:w-auto dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800"
              >
                Prijava
              </Link>
            </div>
          </div>

          {/* VISUAL AREA — premium skincare card (no phone frame, no image) */}
          <div className="relative order-last w-full">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#D9734E]/15 blur-3xl sm:h-96 sm:w-96"
            />
            <div
              className="relative overflow-hidden rounded-[2.5rem] border border-[#E7CDBC] p-8 shadow-[0_30px_80px_rgba(43,42,40,0.16)] sm:p-12 dark:border-neutral-700"
              style={{
                background:
                  "radial-gradient(120% 120% at 20% 10%, #FFF7EF 0%, #FBEDE1 45%, #F3C9B3 100%)",
              }}
            >
              {/* abstract skin / face inspired shape */}
              <div className="relative mx-auto flex aspect-square w-full max-w-sm items-center justify-center">
                <svg
                  viewBox="0 0 320 320"
                  fill="none"
                  aria-hidden="true"
                  className="h-full w-full"
                >
                  <defs>
                    <radialGradient id="hero-skin" cx="38%" cy="32%" r="75%">
                      <stop offset="0%" stopColor="#FFFBF6" />
                      <stop offset="55%" stopColor="#F7D9C4" />
                      <stop offset="100%" stopColor="#D9734E" />
                    </radialGradient>
                    <linearGradient id="hero-stroke" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#E0976F" />
                      <stop offset="100%" stopColor="#D9734E" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M160 24c52 0 96 34 110 84 14 50-6 96-44 132-26 24-44 44-66 44s-40-20-66-44c-38-36-58-82-44-132C64 58 108 24 160 24Z"
                    fill="url(#hero-skin)"
                    opacity="0.95"
                  />
                  <path
                    d="M104 150c14-22 40-34 64-30 22 4 38 18 50 38"
                    stroke="url(#hero-stroke)"
                    strokeWidth="5"
                    strokeLinecap="round"
                    opacity="0.7"
                  />
                  <path
                    d="M94 196c26 20 60 28 92 20 22-6 40-18 52-36"
                    stroke="#FBF4EC"
                    strokeWidth="5"
                    strokeLinecap="round"
                    opacity="0.65"
                  />
                  <circle cx="206" cy="118" r="9" fill="#FBF4EC" opacity="0.85" />
                  <circle cx="128" cy="206" r="6" fill="#FBF4EC" opacity="0.7" />
                  <circle cx="232" cy="200" r="5" fill="#FBF4EC" opacity="0.6" />
                </svg>
              </div>
            </div>

            {/* floating insight cards — grid on mobile, floating on large screens */}
            <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-4 lg:mt-0 lg:block">
              <div className="rounded-2xl border border-[#ECE0D4] bg-white/90 px-4 py-3 shadow-[0_8px_30px_rgba(43,42,40,0.12)] backdrop-blur-sm lg:absolute lg:-left-6 lg:top-12 dark:border-neutral-700 dark:bg-neutral-900/90">
                <span className="block text-xl font-semibold text-[#D9734E]">92%</span>
                <span className="block text-[11px] font-medium text-[#6E6A63] dark:text-neutral-400">
                  Pouzdanost
                </span>
              </div>
              <div className="rounded-2xl border border-[#ECE0D4] bg-white/90 px-4 py-3 shadow-[0_8px_30px_rgba(43,42,40,0.12)] backdrop-blur-sm lg:absolute lg:-right-6 lg:top-20 dark:border-neutral-700 dark:bg-neutral-900/90">
                <span className="block text-sm font-semibold text-[#2B2A28] dark:text-neutral-100">Hidratacija</span>
                <span className="block text-[11px] font-medium text-[#6E6A63] dark:text-neutral-400">
                  Poboljšana
                </span>
              </div>
              <div className="rounded-2xl border border-[#ECE0D4] bg-white/90 px-4 py-3 shadow-[0_8px_30px_rgba(43,42,40,0.12)] backdrop-blur-sm lg:absolute lg:-left-8 lg:bottom-16 dark:border-neutral-700 dark:bg-neutral-900/90">
                <span className="block text-sm font-semibold text-[#2B2A28] dark:text-neutral-100">Barijera kože</span>
                <span className="block text-[11px] font-medium text-[#6E6A63] dark:text-neutral-400">
                  Jača
                </span>
              </div>
              <div className="rounded-2xl border border-[#ECE0D4] bg-white/90 px-4 py-3 shadow-[0_8px_30px_rgba(43,42,40,0.12)] backdrop-blur-sm lg:absolute lg:-right-4 lg:bottom-8 dark:border-neutral-700 dark:bg-neutral-900/90">
                <span className="block text-sm font-semibold text-[#2B2A28] dark:text-neutral-100">AI uvid</span>
                <span className="block text-[11px] font-medium text-[#6E6A63] dark:text-neutral-400">
                  Personalizirano
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2 — KAKO RADI */}
      <section className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#D9734E]">
            Kako radi
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#2B2A28] sm:text-4xl dark:text-neutral-100">
            Tri jednostavna koraka
          </h2>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {steps.map((step) => (
            <div
              key={step.n}
              className="rounded-3xl border border-[#ECE0D4] bg-[#FBF4EC] p-8 shadow-[0_1px_2px_rgba(43,42,40,0.04),0_4px_16px_rgba(43,42,40,0.05)] dark:border-neutral-800 dark:bg-neutral-900"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#D9734E] to-[#E0976F] text-base font-semibold text-white shadow-[0_2px_8px_rgba(217,115,78,0.3)]">
                {step.n}
              </div>
              <h3 className="mt-5 text-lg font-semibold tracking-tight text-[#2B2A28] dark:text-neutral-100">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#6E6A63] dark:text-neutral-400">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 3 — ZAŠTO SKININTEL */}
      <section className="mx-auto max-w-6xl px-6 pb-20 sm:pb-24">
        <div className="rounded-[36px] border border-[#ECE0D4] bg-[#FBF4EC] px-6 py-16 shadow-[0_2px_4px_rgba(43,42,40,0.03),0_12px_40px_rgba(43,42,40,0.06)] sm:px-12 dark:border-neutral-800 dark:bg-neutral-900">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#D9734E]">
              Zašto SkinIntel
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#2B2A28] sm:text-4xl dark:text-neutral-100">
              Tvoj mirni put razumijevanja kože
            </h2>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            {benefits.map((benefit) => (
              <div
                key={benefit.title}
                className="rounded-3xl border border-[#ECE0D4] bg-[#FBF6F0] p-8 dark:border-neutral-800 dark:bg-neutral-950"
              >
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#D9734E]" />
                  <h3 className="text-lg font-semibold tracking-tight text-[#2B2A28] dark:text-neutral-100">
                    {benefit.title}
                  </h3>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-[#6E6A63] dark:text-neutral-400">
                  {benefit.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4 — DISCLAIMER */}
      <section className="mx-auto max-w-3xl px-6 pb-24">
        <div className="rounded-2xl border border-[#E7D9C4] bg-[#FBF1E3] px-6 py-5 text-center dark:border-neutral-800 dark:bg-neutral-900">
          <p className="text-sm leading-relaxed text-[#9A6B2F] dark:text-amber-300/80">
            SkinIntel ne postavlja medicinske dijagnoze. Analize su edukativne i
            informativne prirode.
          </p>
        </div>
      </section>
    </main>
  );
}
