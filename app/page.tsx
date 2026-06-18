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

        <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-6 py-24 sm:py-32 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#E7CDBC] bg-[#FBF6F0]/80 px-4 py-1.5 shadow-[0_1px_2px_rgba(43,42,40,0.04)] backdrop-blur-sm dark:border-neutral-700 dark:bg-neutral-800/70">
              <span className="h-1.5 w-1.5 rounded-full bg-[#D9734E]" />
              <span className="bg-gradient-to-r from-[#D9734E] to-[#E0976F] bg-clip-text text-[11px] font-semibold uppercase tracking-[0.32em] text-transparent">
                SkinIntel
              </span>
            </span>
            <h1 className="mt-8 text-4xl font-semibold leading-[1.08] tracking-tight text-[#2B2A28] sm:text-6xl dark:text-neutral-50">
              Razumij svoju kožu uz pomoć umjetne inteligencije
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[#6E6A63] sm:text-xl dark:text-neutral-300">
              Učitaj fotografiju kože, opiši problem i dobij edukativnu analizu koja ti pomaže pratiti promjene kroz vrijeme.
            </p>
            <div className="mt-10 flex w-full flex-col items-center gap-4 sm:w-auto sm:flex-row">
              <Link
                href="/dashboard"
                className="inline-flex w-full items-center justify-center rounded-2xl bg-[#D9734E] px-8 py-3.5 text-sm font-semibold text-white shadow-[0_2px_12px_rgba(217,115,78,0.28)] hover:bg-[#C45F3D] sm:w-auto"
              >
                Pokreni analizu
              </Link>
              <Link
                href="/auth/login"
                className="inline-flex w-full items-center justify-center rounded-2xl border border-[#ECE0D4] bg-[#FBF4EC] px-8 py-3.5 text-sm font-semibold text-[#2B2A28] hover:bg-[#F7DECF] sm:w-auto dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800"
              >
                Prijava
              </Link>
            </div>
          </div>
          <div className="relative order-last w-full">
            <img
              src="/assets/images/18_SKININTEL_HERO_VISUAL_V2.webp"
              alt="SkinIntel AI analiza kože"
              className="h-auto w-full rounded-3xl object-cover shadow-[0_20px_60px_rgba(43,42,40,0.12)]"
            />
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
