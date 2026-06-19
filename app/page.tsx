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
              "radial-gradient(120% 120% at 50% 0%, #FBF4EC 0%, rgba(251,244,236,0) 60%), radial-gradient(80% 80% at 85% 8%, rgba(217,115,78,0.10) 0%, rgba(217,115,78,0) 50%), radial-gradient(70% 70% at 10% 30%, rgba(243,201,179,0.18) 0%, rgba(243,201,179,0) 55%)",
          }}
        />

        <div className="relative mx-auto w-full max-w-6xl px-5 pb-14 pt-6 sm:px-6 sm:pb-20 sm:pt-8">
          {/* 1 — Brand row */}
          <div className="flex items-center justify-between">
            <span className="bg-gradient-to-r from-[#D9734E] to-[#E0976F] bg-clip-text text-lg font-semibold tracking-tight text-transparent">
              SkinIntel
            </span>
            <button
              type="button"
              aria-label="Izbornik"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#ECE0D4] bg-[#FBF4EC] text-[#2B2A28] shadow-[0_1px_2px_rgba(43,42,40,0.04)] hover:bg-[#F7DECF] dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
            >
              <span className="flex flex-col gap-1">
                <span className="block h-0.5 w-5 rounded-full bg-current" />
                <span className="block h-0.5 w-5 rounded-full bg-current" />
                <span className="block h-0.5 w-5 rounded-full bg-current" />
              </span>
            </button>
          </div>

          <div className="mt-10 grid grid-cols-1 items-center gap-12 sm:mt-14 lg:grid-cols-2 lg:gap-16">
            {/* Text column */}
            <div className="flex flex-col items-start text-left">
              {/* 2 — Pill */}
              <span className="inline-flex items-center gap-2 rounded-full border border-[#E7CDBC] bg-[#FBF6F0]/80 px-4 py-1.5 shadow-[0_1px_2px_rgba(43,42,40,0.04)] backdrop-blur-sm dark:border-neutral-700 dark:bg-neutral-800/70">
                <span className="h-1.5 w-1.5 rounded-full bg-[#D9734E]" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#D9734E]">
                  AI analiza kože
                </span>
              </span>

              {/* 3 — Headline */}
              <h1 className="mt-6 text-[2rem] font-semibold leading-[1.1] tracking-tight text-[#2B2A28] sm:text-5xl lg:text-6xl dark:text-neutral-50">
                Što tvoja koža pokušava reći?
              </h1>

              {/* 4 — Subtitle */}
              <p className="mt-5 max-w-xl text-base leading-relaxed text-[#6E6A63] sm:text-lg dark:text-neutral-300">
                Učitaj fotografiju i dobij edukativnu AI analizu s jasnim
                preporukama za njegu.
              </p>

              {/* 5 + 6 — CTAs */}
              <div className="mt-8 flex w-full flex-col gap-3 sm:max-w-md sm:flex-row">
                <Link
                  href="/dashboard"
                  className="inline-flex w-full items-center justify-center rounded-2xl bg-[#D9734E] px-7 py-3.5 text-sm font-semibold text-white shadow-[0_2px_12px_rgba(217,115,78,0.28)] hover:bg-[#C45F3D]"
                >
                  Pokreni besplatnu analizu
                </Link>
                <Link
                  href="/auth/login"
                  className="inline-flex w-full items-center justify-center rounded-2xl border border-[#ECE0D4] bg-[#FBF4EC] px-7 py-3.5 text-sm font-semibold text-[#2B2A28] hover:bg-[#F7DECF] sm:w-auto dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800"
                >
                  Prijava
                </Link>
              </div>

              {/* 7 — Trust row */}
              <ul className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-medium text-[#6E6A63] dark:text-neutral-400">
                <li className="inline-flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#D9734E]" />
                  Privatno i sigurno
                </li>
                <li className="inline-flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#D9734E]" />
                  Bez medicinskih dijagnoza
                </li>
                <li className="inline-flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#D9734E]" />
                  1 besplatna analiza
                </li>
              </ul>
            </div>

            {/* 8 — Product visual block */}
            <div className="relative mx-auto w-full max-w-md lg:mx-0 lg:ml-auto">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -inset-6 -z-10 rounded-[40px] bg-[#F3C9B3]/30 blur-2xl"
              />
              <div className="overflow-hidden rounded-[28px] border border-[#E7CDBC] bg-[#FBF4EC] shadow-[0_24px_60px_rgba(43,42,40,0.18)] dark:border-neutral-700">
                <img
                  src="/assets/images/20_SKININTEL_MOBILE_ANALYSIS_HERO_V1.webp"
                  alt="SkinIntel analiza kože"
                  className="aspect-[4/5] w-full object-cover"
                />
              </div>

              <div className="absolute -left-2 top-6 rounded-2xl border border-[#ECE0D4] bg-white/95 px-3 py-2 shadow-[0_8px_30px_rgba(43,42,40,0.12)] backdrop-blur-sm sm:-left-5 dark:border-neutral-700 dark:bg-neutral-900/95">
                <span className="block text-base font-semibold text-[#D9734E]">
                  92%
                </span>
                <span className="block text-[10px] font-medium text-[#6E6A63] dark:text-neutral-400">
                  Pouzdanost
                </span>
              </div>

              <div className="absolute -right-2 top-6 rounded-2xl border border-[#ECE0D4] bg-white/95 px-3 py-2 text-right shadow-[0_8px_30px_rgba(43,42,40,0.12)] backdrop-blur-sm sm:-right-5 dark:border-neutral-700 dark:bg-neutral-900/95">
                <span className="block text-sm font-semibold text-[#D9734E]">
                  Crvenilo
                </span>
                <span className="block text-[10px] font-medium text-[#6E6A63] dark:text-neutral-400">
                  Smanjeno
                </span>
              </div>

              <div className="absolute -left-2 bottom-6 rounded-2xl border border-[#ECE0D4] bg-white/95 px-3 py-2 shadow-[0_8px_30px_rgba(43,42,40,0.12)] backdrop-blur-sm sm:-left-5 dark:border-neutral-700 dark:bg-neutral-900/95">
                <span className="block text-sm font-semibold text-[#D9734E]">
                  Hidratacija
                </span>
                <span className="block text-[10px] font-medium text-[#6E6A63] dark:text-neutral-400">
                  Poboljšana
                </span>
              </div>

              <div className="absolute -right-2 bottom-6 rounded-2xl border border-[#ECE0D4] bg-white/95 px-3 py-2 text-right shadow-[0_8px_30px_rgba(43,42,40,0.12)] backdrop-blur-sm sm:-right-5 dark:border-neutral-700 dark:bg-neutral-900/95">
                <span className="block text-sm font-semibold text-[#D9734E]">
                  Barijera kože
                </span>
                <span className="block text-[10px] font-medium text-[#6E6A63] dark:text-neutral-400">
                  Jača
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
