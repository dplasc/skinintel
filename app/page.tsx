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
                <div className="mt-8 flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row">
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
                  <Link
                    href="/auth/login"
                    className="inline-flex w-full items-center justify-center rounded-2xl border border-[#ECE0D4] bg-[#FBF4EC] px-8 py-4 text-base font-semibold text-[#2B2A28] hover:bg-[#F7DECF] sm:w-auto dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800"
                  >
                    Prijava
                  </Link>
                </div>

                <div className="mt-7 flex w-full flex-wrap items-center justify-center gap-x-5 gap-y-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#6E6A63] dark:text-neutral-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#D9734E]" />
                    Privatno i sigurno
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#6E6A63] dark:text-neutral-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#D9734E]" />
                    Bez medicinskih dijagnoza
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#6E6A63] dark:text-neutral-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#D9734E]" />
                    1 besplatna analiza
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-8 overflow-hidden rounded-[28px] px-3 pb-3 sm:mt-10 sm:px-4 sm:pb-4">
              <div className="relative overflow-hidden rounded-[24px]">
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

                <div className="absolute left-3 top-1/2 -translate-y-1/2 rounded-2xl border border-white/60 bg-white/85 px-3 py-2 shadow-[0_8px_24px_rgba(43,42,40,0.14)] backdrop-blur-sm sm:left-5 sm:px-4 sm:py-2.5 dark:border-white/10 dark:bg-neutral-900/80">
                  <span className="block text-[10px] font-medium text-[#6E6A63] sm:text-xs dark:text-neutral-400">
                    Crvenilo
                  </span>
                  <span className="flex items-center gap-1 text-sm font-semibold text-[#4E9D6B] sm:text-base">
                    Smanjeno
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <polyline points="19 12 12 19 5 12" />
                    </svg>
                  </span>
                </div>

                <div className="absolute bottom-3 left-3 rounded-2xl border border-white/60 bg-white/85 px-3 py-2 shadow-[0_8px_24px_rgba(43,42,40,0.14)] backdrop-blur-sm sm:bottom-5 sm:left-5 sm:px-4 sm:py-2.5 dark:border-white/10 dark:bg-neutral-900/80">
                  <span className="block text-[10px] font-medium text-[#6E6A63] sm:text-xs dark:text-neutral-400">
                    Barijera kože
                  </span>
                  <span className="flex items-center gap-1 text-sm font-semibold text-[#4E9D6B] sm:text-base">
                    Jača
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <line x1="12" y1="19" x2="12" y2="5" />
                      <polyline points="5 12 12 5 19 12" />
                    </svg>
                  </span>
                </div>

                <div className="absolute bottom-3 right-3 rounded-2xl border border-[#F3C9B3]/70 bg-[#FBF1E8]/90 px-3 py-2 shadow-[0_8px_24px_rgba(43,42,40,0.14)] backdrop-blur-sm sm:bottom-5 sm:right-5 sm:px-4 sm:py-2.5 dark:border-white/10 dark:bg-neutral-900/80">
                  <span className="block text-[10px] font-medium text-[#6E6A63] sm:text-xs dark:text-neutral-400">
                    Hidratacija
                  </span>
                  <span className="flex items-center gap-1 text-sm font-semibold text-[#4E9D6B] sm:text-base">
                    Poboljšana
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <line x1="12" y1="19" x2="12" y2="5" />
                      <polyline points="5 12 12 5 19 12" />
                    </svg>
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
        <div className="mt-12">
          <img
            src="/assets/images/skinintel-before-after-v1.webp"
            alt="SkinIntel prije i poslije praćenja stanja kože"
            className="mx-auto w-full rounded-3xl border border-[#ECE0D4] shadow-[0_2px_4px_rgba(43,42,40,0.03),0_12px_40px_rgba(43,42,40,0.08)] dark:border-neutral-800"
          />
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
