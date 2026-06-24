import Link from "next/link";

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
        <div className="relative mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
          <div className="overflow-hidden rounded-[32px] border border-[#ECE0D4] bg-[#FFFDFA] shadow-[0_2px_4px_rgba(43,42,40,0.03),0_24px_70px_rgba(43,42,40,0.10)] sm:rounded-[36px] dark:border-neutral-800 dark:bg-neutral-900">
            <div className="px-6 pt-6 sm:px-10 sm:pt-8">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold tracking-tight text-[#2B2A28] dark:text-neutral-50">
                  SkinIntel
                </span>
                <Link
                  href="/auth/login"
                  className="text-sm font-medium text-[#6E6A63] transition hover:text-[#2B2A28] dark:text-neutral-400 dark:hover:text-neutral-100"
                >
                  Prijava
                </Link>
              </div>

              <div className="mt-8 flex flex-col items-center text-center sm:mt-10">
                <span className="inline-flex items-center gap-2 rounded-full border border-[#E7CDBC] bg-[#FBF6F0]/80 px-4 py-1.5 shadow-[0_1px_2px_rgba(43,42,40,0.04)] backdrop-blur-sm dark:border-neutral-700 dark:bg-neutral-800/70">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#D9734E]" />
                  <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#D9734E]">
                    AI analiza kože
                  </span>
                </span>
                <h1 className="mt-7 text-[2.6rem] font-semibold leading-[1.05] tracking-[-0.02em] text-[#2B2A28] sm:text-6xl dark:text-neutral-50">
                  Što tvoja koža pokušava reći?
                </h1>
                <p className="mt-5 max-w-md text-lg leading-relaxed text-[#6E6A63] sm:text-xl dark:text-neutral-300">
                  AI analiza kože u manje od 60 sekundi.
                </p>
                <div className="mt-8 flex w-full flex-col items-center sm:w-auto">
                  <Link
                    href="/dashboard"
                    className="group inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#D9734E] px-8 py-4 text-base font-semibold text-white shadow-[0_8px_24px_rgba(217,115,78,0.32)] transition hover:bg-[#C45F3D] sm:w-auto"
                  >
                    Pokreni besplatnu analizu
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                      className="transition-transform group-hover:translate-x-0.5"
                    >
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </Link>
                  <p className="mt-4 text-[11px] font-medium tracking-[0.12em] text-[#6E6A63]/80 dark:text-neutral-400">
                    Besplatno · Brzo · Bez obveze
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 overflow-hidden rounded-[28px] px-3 pb-3 sm:mt-10 sm:px-4 sm:pb-4">
              <div className="relative max-h-[460px] overflow-hidden rounded-[24px] sm:max-h-none">
                <img
                  src="/assets/images/SkinIntel Hero Background V1.webp"
                  alt="SkinIntel AI analiza kože"
                  className="h-full w-full rounded-[24px] object-cover"
                />

                <div className="absolute left-3 top-3 rounded-2xl border border-white/60 bg-white/85 px-3 py-2 shadow-[0_8px_24px_rgba(43,42,40,0.14)] backdrop-blur-sm sm:left-5 sm:top-5 sm:px-4 sm:py-2.5 dark:border-white/10 dark:bg-neutral-900/80">
                  <span className="block text-[8px] font-semibold uppercase tracking-[0.18em] text-[#6E6A63] sm:text-[10px] dark:text-neutral-400">
                    Pouzdanost analize
                  </span>
                  <span className="block text-lg font-semibold text-[#D9734E] sm:text-2xl">
                    92%
                  </span>
                </div>

                <div className="absolute bottom-3 right-3 rounded-2xl border border-white/60 bg-white/85 px-3 py-2 shadow-[0_8px_24px_rgba(43,42,40,0.14)] backdrop-blur-sm sm:bottom-5 sm:right-5 sm:px-4 sm:py-2.5 dark:border-white/10 dark:bg-neutral-900/80">
                  <span className="block text-[8px] font-semibold uppercase tracking-[0.18em] text-[#6E6A63] sm:text-[10px] dark:text-neutral-400">
                    Praćenje promjena
                  </span>
                  <span className="block text-lg font-semibold text-[#D9734E] sm:text-2xl">
                    14 dana
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2 — PRAĆENJE NAPRETKA */}
      <section className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#D9734E]">
            Praćenje napretka
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#2B2A28] sm:text-4xl dark:text-neutral-100">
            Prije / poslije kroz vrijeme
          </h2>
          <p className="mt-4 text-base leading-relaxed text-[#6E6A63] sm:text-lg dark:text-neutral-300">
            SkinIntel ti pomaže pratiti kako se stanje kože mijenja kroz dane i
            tjedne — bez nagađanja.
          </p>
        </div>
        <div className="-mx-4 mt-14 sm:mx-0 sm:mt-16">
          <div className="rounded-3xl border border-[#ECE0D4] bg-[#FBF4EC] p-4 shadow-[0_4px_8px_rgba(43,42,40,0.04),0_24px_70px_rgba(43,42,40,0.12)] sm:p-6 dark:border-neutral-800 dark:bg-neutral-900">
            <div className="grid grid-cols-1 items-center gap-3 sm:grid-cols-[1fr_auto_1fr] sm:gap-4">
              <div className="rounded-2xl border border-[#ECE0D4] bg-[#FFFDFA] p-4 shadow-[0_1px_2px_rgba(43,42,40,0.04),0_4px_16px_rgba(43,42,40,0.05)] sm:p-5 dark:border-neutral-700 dark:bg-neutral-950">
                <span className="inline-flex items-center rounded-full bg-[#F7DECF] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#B85C3A] sm:px-3 sm:text-[11px] dark:bg-neutral-800 dark:text-amber-300/90">
                  Prva analiza
                </span>
                <ul className="mt-4 space-y-2.5">
                  <li className="flex items-start gap-2 text-sm leading-snug text-[#6E6A63] dark:text-neutral-400">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#D9734E]" />
                    Blaga crvenila
                  </li>
                  <li className="flex items-start gap-2 text-sm leading-snug text-[#6E6A63] dark:text-neutral-400">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#D9734E]" />
                    Neravnomjeran ton
                  </li>
                  <li className="flex items-start gap-2 text-sm leading-snug text-[#6E6A63] dark:text-neutral-400">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#D9734E]" />
                    Osjetljiva barijera
                  </li>
                </ul>
              </div>
              <div
                aria-hidden="true"
                className="flex justify-center text-[#D9734E]/70 dark:text-neutral-500"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="rotate-90 sm:rotate-0"
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </div>
              <div className="rounded-2xl border border-[#ECE0D4] bg-[#FFFDFA] p-4 shadow-[0_1px_2px_rgba(43,42,40,0.04),0_4px_16px_rgba(43,42,40,0.05)] sm:p-5 dark:border-neutral-700 dark:bg-neutral-950">
                <span className="inline-flex items-center rounded-full bg-[#E3F0E6] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#3F7A54] sm:px-3 sm:text-[11px] dark:bg-neutral-800 dark:text-emerald-300/90">
                  Nakon 14 dana
                </span>
                <ul className="mt-4 space-y-2.5">
                  <li className="flex items-start gap-2 text-sm leading-snug text-[#6E6A63] dark:text-neutral-400">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#4E9D6B]" />
                    Manje crvenila
                  </li>
                  <li className="flex items-start gap-2 text-sm leading-snug text-[#6E6A63] dark:text-neutral-400">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#4E9D6B]" />
                    Ujednačeniji ton
                  </li>
                  <li className="flex items-start gap-2 text-sm leading-snug text-[#6E6A63] dark:text-neutral-400">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#4E9D6B]" />
                    Stabilnija koža
                  </li>
                </ul>
              </div>
            </div>
            <div className="mt-4 flex justify-center sm:mt-6">
              <div className="inline-flex flex-wrap items-center justify-center gap-x-3 gap-y-2 rounded-full border border-[#ECE0D4] bg-white/90 px-4 py-2.5 shadow-[0_4px_16px_rgba(43,42,40,0.06)] dark:border-neutral-700 dark:bg-neutral-900/90">
                <span className="text-sm font-semibold text-[#4E9D6B]">
                  +28% vidljiv napredak
                </span>
                <span className="hidden h-4 w-px bg-[#ECE0D4] sm:block dark:bg-neutral-700" />
                <span className="text-sm font-medium text-[#6E6A63] dark:text-neutral-400">
                  14 dana praćenja
                </span>
              </div>
            </div>
          </div>
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
          <div className="mx-auto mt-8 max-w-2xl overflow-hidden rounded-[28px] border border-[#E7D9C4] bg-[#FFFDFA] shadow-[0_2px_4px_rgba(43,42,40,0.03),0_8px_32px_rgba(43,42,40,0.05)] dark:border-neutral-800 dark:bg-neutral-950">
            {benefits.map((benefit, index) => (
              <div
                key={benefit.title}
                className={`px-6 py-5 sm:px-8 sm:py-6${
                  index < benefits.length - 1
                    ? " border-b border-[#ECE0D4] dark:border-neutral-800"
                    : ""
                }`}
              >
                <div className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#D9734E]" />
                  <div>
                    <h3 className="text-base font-semibold tracking-tight text-[#2B2A28] dark:text-neutral-100">
                      {benefit.title}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-[#6E6A63] dark:text-neutral-400">
                      {benefit.desc}
                    </p>
                  </div>
                </div>
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
