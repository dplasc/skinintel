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
        <div className="relative mx-auto max-w-6xl px-6 py-8 sm:py-12">
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold tracking-tight text-[#2B2A28] dark:text-neutral-50">
              SkinIntel
            </span>
            <button
              type="button"
              aria-label="Izbornik"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#ECE0D4] bg-[#FBF4EC] text-[#2B2A28] dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          </div>

          <div className="mt-10 flex flex-col items-center text-center sm:mt-14">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#E7CDBC] bg-[#FBF6F0]/80 px-4 py-1.5 shadow-[0_1px_2px_rgba(43,42,40,0.04)] backdrop-blur-sm dark:border-neutral-700 dark:bg-neutral-800/70">
              <span className="h-1.5 w-1.5 rounded-full bg-[#D9734E]" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#D9734E]">
                AI analiza kože
              </span>
            </span>
            <h1 className="mt-8 text-4xl font-semibold leading-[1.08] tracking-tight text-[#2B2A28] sm:text-6xl dark:text-neutral-50">
              Što tvoja koža pokušava reći?
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[#6E6A63] sm:text-xl dark:text-neutral-300">
              AI analiza kože u manje od 60 sekundi.
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

          <div className="mt-12 overflow-hidden rounded-3xl shadow-[0_30px_80px_rgba(43,42,40,0.16)]">
            <img
              src="/assets/images/SkinIntel Hero Background V1.webp"
              alt="SkinIntel AI analiza kože"
              className="h-full w-full object-cover"
            />
          </div>

          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="flex items-center justify-center gap-2 rounded-2xl border border-[#ECE0D4] bg-white/90 px-4 py-3 text-center shadow-[0_4px_16px_rgba(43,42,40,0.06)] dark:border-neutral-700 dark:bg-neutral-900/90">
              <span className="h-1.5 w-1.5 rounded-full bg-[#D9734E]" />
              <span className="text-sm font-medium text-[#2B2A28] dark:text-neutral-100">
                Privatno i sigurno
              </span>
            </div>
            <div className="flex items-center justify-center gap-2 rounded-2xl border border-[#ECE0D4] bg-white/90 px-4 py-3 text-center shadow-[0_4px_16px_rgba(43,42,40,0.06)] dark:border-neutral-700 dark:bg-neutral-900/90">
              <span className="h-1.5 w-1.5 rounded-full bg-[#D9734E]" />
              <span className="text-sm font-medium text-[#2B2A28] dark:text-neutral-100">
                Bez medicinskih dijagnoza
              </span>
            </div>
            <div className="flex items-center justify-center gap-2 rounded-2xl border border-[#ECE0D4] bg-white/90 px-4 py-3 text-center shadow-[0_4px_16px_rgba(43,42,40,0.06)] dark:border-neutral-700 dark:bg-neutral-900/90">
              <span className="h-1.5 w-1.5 rounded-full bg-[#D9734E]" />
              <span className="text-sm font-medium text-[#2B2A28] dark:text-neutral-100">
                1 besplatna analiza
              </span>
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
