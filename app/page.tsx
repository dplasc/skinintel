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
              <div className="relative aspect-[4/5] overflow-hidden rounded-[24px] sm:aspect-[3/4]">
                <img
                  src="/assets/images/hero-v2/skinintel_hero_v2_final.webp"
                  alt="SkinIntel AI analiza kože"
                  className="absolute inset-0 h-full w-full object-cover object-[center_32%]"
                />

                {/* AI scan glow + dotted overlay */}
                <svg
                  viewBox="0 0 200 200"
                  fill="none"
                  aria-hidden="true"
                  className="pointer-events-none absolute left-1/2 top-[38%] h-[50%] max-h-[200px] w-[50%] max-w-[200px] -translate-x-1/2 -translate-y-1/2 sm:top-[36%] sm:max-h-[240px] sm:max-w-[240px]"
                >
                  <defs>
                    <radialGradient
                      id="hero-scan-glow"
                      cx="0"
                      cy="0"
                      r="1"
                      gradientUnits="userSpaceOnUse"
                      gradientTransform="translate(100 100) rotate(90) scale(100)"
                    >
                      <stop stopColor="#D9734E" stopOpacity="0.28" />
                      <stop offset="0.55" stopColor="#D9734E" stopOpacity="0.08" />
                      <stop offset="1" stopColor="#D9734E" stopOpacity="0" />
                    </radialGradient>
                  </defs>
                  <circle cx="100" cy="100" r="88" fill="url(#hero-scan-glow)" />
                  <circle
                    cx="100"
                    cy="100"
                    r="72"
                    stroke="#D9734E"
                    strokeOpacity="0.45"
                    strokeWidth="1"
                    strokeDasharray="3 7"
                  />
                  <circle
                    cx="100"
                    cy="100"
                    r="52"
                    stroke="#FFFDFA"
                    strokeOpacity="0.35"
                    strokeWidth="0.75"
                    strokeDasharray="2 5"
                  />
                  <line
                    x1="28"
                    y1="100"
                    x2="172"
                    y2="100"
                    stroke="#D9734E"
                    strokeOpacity="0.25"
                    strokeWidth="0.75"
                    strokeDasharray="4 6"
                  />
                  <line
                    x1="100"
                    y1="28"
                    x2="100"
                    y2="172"
                    stroke="#D9734E"
                    strokeOpacity="0.18"
                    strokeWidth="0.75"
                    strokeDasharray="4 6"
                  />
                  <circle cx="100" cy="100" r="4" fill="#D9734E" fillOpacity="0.7" />
                  <circle cx="100" cy="100" r="8" stroke="#D9734E" strokeOpacity="0.35" strokeWidth="1" />
                </svg>

                <div className="absolute left-3 top-3 rounded-2xl border border-white/70 bg-gradient-to-br from-white/95 to-white/80 px-3 py-2 shadow-[0_8px_28px_rgba(43,42,40,0.16)] backdrop-blur-md sm:left-5 sm:top-5 sm:px-4 sm:py-2.5 dark:border-white/10 dark:from-neutral-900/90 dark:to-neutral-900/75">
                  <span className="block text-[8px] font-semibold uppercase tracking-[0.18em] text-[#6E6A63] sm:text-[10px] dark:text-neutral-400">
                    Pouzdanost analize
                  </span>
                  <span className="mt-0.5 block text-lg font-semibold leading-none text-[#D9734E] sm:text-2xl">
                    92%
                  </span>
                </div>

                <div className="absolute bottom-11 right-3 rounded-2xl border border-white/70 bg-gradient-to-br from-white/95 to-white/80 px-3 py-2 shadow-[0_8px_28px_rgba(43,42,40,0.16)] backdrop-blur-md sm:bottom-14 sm:right-5 sm:px-4 sm:py-2.5 dark:border-white/10 dark:from-neutral-900/90 dark:to-neutral-900/75">
                  <span className="block text-[8px] font-semibold uppercase tracking-[0.18em] text-[#6E6A63] sm:text-[10px] dark:text-neutral-400">
                    Praćenje promjena
                  </span>
                  <span className="mt-0.5 block text-lg font-semibold leading-none text-[#D9734E] sm:text-2xl">
                    14 dana
                  </span>
                </div>

                {/* Mini feature strip */}
                <div className="absolute inset-x-0 bottom-0 border-t border-white/30 bg-gradient-to-t from-[#2B2A28]/55 to-[#2B2A28]/30 px-3 py-2 backdrop-blur-sm sm:px-4 sm:py-2.5">
                  <ul className="flex items-center justify-around gap-1">
                    <li className="flex items-center gap-1.5">
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#F7DECF"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                      </svg>
                      <span className="text-[10px] font-semibold tracking-wide text-white/95 sm:text-[11px]">
                        Brzo
                      </span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#F7DECF"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                      <span className="text-[10px] font-semibold tracking-wide text-white/95 sm:text-[11px]">
                        Privatno
                      </span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#F7DECF"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                      </svg>
                      <span className="text-[10px] font-semibold tracking-wide text-white/95 sm:text-[11px]">
                        Praćenje
                      </span>
                    </li>
                  </ul>
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
          <div className="overflow-hidden rounded-3xl border border-[#ECE0D4] bg-[#FBF4EC] p-4 shadow-[0_4px_8px_rgba(43,42,40,0.04),0_24px_70px_rgba(43,42,40,0.12)] sm:p-6 dark:border-neutral-800 dark:bg-neutral-900">
            <div className="overflow-hidden rounded-2xl border border-[#ECE0D4]/80 bg-[#FFFDFA] dark:border-neutral-700 dark:bg-neutral-950">
              {/* Tracking header */}
              <div className="border-b border-[#ECE0D4]/80 px-4 py-4 sm:px-5 sm:py-5 dark:border-neutral-800">
                <div className="flex flex-wrap items-center justify-between gap-2.5">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-[#E7CDBC] bg-[#FBF6F0] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#D9734E] sm:text-[11px] dark:border-neutral-700 dark:bg-neutral-900">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#D9734E]" />
                    SkinIntel praćenje
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-[#C8E0D0] bg-[#E3F0E6]/70 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#3F7A54] sm:text-[11px] dark:border-neutral-700 dark:bg-neutral-800/80 dark:text-emerald-300/90">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full rounded-full bg-[#4E9D6B] opacity-30" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-[#4E9D6B]" />
                    </span>
                    Aktivno praćenje
                  </span>
                </div>

                <div className="mt-4 sm:mt-5">
                  <svg
                    viewBox="0 0 400 56"
                    fill="none"
                    className="mx-auto w-full max-w-lg"
                    aria-hidden="true"
                  >
                    <defs>
                      <linearGradient
                        id="section2-progress"
                        x1="40"
                        y1="28"
                        x2="360"
                        y2="28"
                        gradientUnits="userSpaceOnUse"
                      >
                        <stop stopColor="#ECE0D4" />
                        <stop offset="0.45" stopColor="#E8B89A" />
                        <stop offset="1" stopColor="#D9734E" />
                      </linearGradient>
                      <radialGradient
                        id="section2-glow"
                        cx="0"
                        cy="0"
                        r="1"
                        gradientUnits="userSpaceOnUse"
                        gradientTransform="translate(360 28) rotate(90) scale(14)"
                      >
                        <stop stopColor="#D9734E" stopOpacity="0.35" />
                        <stop offset="1" stopColor="#D9734E" stopOpacity="0" />
                      </radialGradient>
                    </defs>
                    <line
                      x1="40"
                      y1="28"
                      x2="360"
                      y2="28"
                      stroke="#ECE0D4"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <line
                      x1="40"
                      y1="28"
                      x2="360"
                      y2="28"
                      stroke="url(#section2-progress)"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                    <circle cx="360" cy="28" r="14" fill="url(#section2-glow)" />
                    <circle
                      cx="40"
                      cy="28"
                      r="6"
                      fill="#FFFDFA"
                      stroke="#D9734E"
                      strokeWidth="2"
                    />
                    <circle cx="40" cy="28" r="2" fill="#D9734E" />
                    <circle
                      cx="200"
                      cy="28"
                      r="7"
                      fill="#FFFDFA"
                      stroke="#E8B89A"
                      strokeWidth="2"
                    />
                    <circle cx="200" cy="28" r="2.5" fill="#D9734E" fillOpacity="0.55" />
                    <circle
                      cx="360"
                      cy="28"
                      r="8"
                      fill="#D9734E"
                      stroke="#FFFDFA"
                      strokeWidth="2"
                    />
                    <circle cx="360" cy="28" r="3" fill="#FFFDFA" fillOpacity="0.9" />
                  </svg>
                  <div className="mx-auto mt-2 grid max-w-lg grid-cols-3 text-center">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#6E6A63] sm:text-[11px] dark:text-neutral-400">
                      Dan 1
                    </span>
                    <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#6E6A63] sm:text-[11px] dark:text-neutral-400">
                      Dan 7
                    </span>
                    <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#D9734E] sm:text-[11px]">
                      Dan 14
                    </span>
                  </div>
                </div>
              </div>

              {/* Before / after result panels */}
              <div className="relative grid grid-cols-1 sm:grid-cols-2">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-y-4 left-1/2 hidden w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-[#ECE0D4] to-transparent sm:block dark:via-neutral-700"
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute left-1/2 top-1/2 z-10 hidden h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[#ECE0D4] bg-[#FFFDFA] shadow-sm sm:flex dark:border-neutral-700 dark:bg-neutral-950"
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#D9734E"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <polyline points="9 6 4 12 9 18" />
                    <polyline points="15 6 20 12 15 18" />
                  </svg>
                </div>

                <div className="border-b border-[#ECE0D4]/80 p-4 sm:border-b-0 sm:border-r sm:p-5 dark:border-neutral-800">
                  <span className="inline-flex items-center rounded-full bg-[#F7DECF] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#B85C3A] sm:text-[11px] dark:bg-neutral-800 dark:text-amber-300/90">
                    Prva analiza
                  </span>
                  <ul className="mt-4 space-y-3">
                    <li className="flex items-center gap-3 rounded-xl border border-[#ECE0D4]/60 bg-[#FBF6F0]/50 px-3 py-2.5 dark:border-neutral-800 dark:bg-neutral-900/50">
                      <span className="h-2 w-2 shrink-0 rounded-full bg-[#D9734E]" />
                      <div className="min-w-0 flex-1">
                        <span className="block text-[9px] font-semibold uppercase tracking-[0.14em] text-[#6E6A63]/80 dark:text-neutral-500">
                          Crvenila
                        </span>
                        <span className="block text-sm font-medium leading-snug text-[#2B2A28] dark:text-neutral-200">
                          Blaga crvenila
                        </span>
                      </div>
                    </li>
                    <li className="flex items-center gap-3 rounded-xl border border-[#ECE0D4]/60 bg-[#FBF6F0]/50 px-3 py-2.5 dark:border-neutral-800 dark:bg-neutral-900/50">
                      <span className="h-2 w-2 shrink-0 rounded-full bg-[#D9734E]" />
                      <div className="min-w-0 flex-1">
                        <span className="block text-[9px] font-semibold uppercase tracking-[0.14em] text-[#6E6A63]/80 dark:text-neutral-500">
                          Ton kože
                        </span>
                        <span className="block text-sm font-medium leading-snug text-[#2B2A28] dark:text-neutral-200">
                          Neravnomjeran ton
                        </span>
                      </div>
                    </li>
                    <li className="flex items-center gap-3 rounded-xl border border-[#ECE0D4]/60 bg-[#FBF6F0]/50 px-3 py-2.5 dark:border-neutral-800 dark:bg-neutral-900/50">
                      <span className="h-2 w-2 shrink-0 rounded-full bg-[#D9734E]" />
                      <div className="min-w-0 flex-1">
                        <span className="block text-[9px] font-semibold uppercase tracking-[0.14em] text-[#6E6A63]/80 dark:text-neutral-500">
                          Barijera
                        </span>
                        <span className="block text-sm font-medium leading-snug text-[#2B2A28] dark:text-neutral-200">
                          Osjetljiva barijera
                        </span>
                      </div>
                    </li>
                  </ul>
                </div>

                <div className="p-4 sm:p-5">
                  <span className="inline-flex items-center rounded-full bg-[#E3F0E6] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#3F7A54] sm:text-[11px] dark:bg-neutral-800 dark:text-emerald-300/90">
                    Nakon 14 dana
                  </span>
                  <ul className="mt-4 space-y-3">
                    <li className="flex items-center gap-3 rounded-xl border border-[#ECE0D4]/60 bg-[#E3F0E6]/25 px-3 py-2.5 dark:border-neutral-800 dark:bg-neutral-900/50">
                      <span className="h-2 w-2 shrink-0 rounded-full bg-[#4E9D6B]" />
                      <div className="min-w-0 flex-1">
                        <span className="block text-[9px] font-semibold uppercase tracking-[0.14em] text-[#6E6A63]/80 dark:text-neutral-500">
                          Crvenila
                        </span>
                        <span className="block text-sm font-medium leading-snug text-[#2B2A28] dark:text-neutral-200">
                          Manje crvenila
                        </span>
                      </div>
                    </li>
                    <li className="flex items-center gap-3 rounded-xl border border-[#ECE0D4]/60 bg-[#E3F0E6]/25 px-3 py-2.5 dark:border-neutral-800 dark:bg-neutral-900/50">
                      <span className="h-2 w-2 shrink-0 rounded-full bg-[#4E9D6B]" />
                      <div className="min-w-0 flex-1">
                        <span className="block text-[9px] font-semibold uppercase tracking-[0.14em] text-[#6E6A63]/80 dark:text-neutral-500">
                          Ton kože
                        </span>
                        <span className="block text-sm font-medium leading-snug text-[#2B2A28] dark:text-neutral-200">
                          Ujednačeniji ton
                        </span>
                      </div>
                    </li>
                    <li className="flex items-center gap-3 rounded-xl border border-[#ECE0D4]/60 bg-[#E3F0E6]/25 px-3 py-2.5 dark:border-neutral-800 dark:bg-neutral-900/50">
                      <span className="h-2 w-2 shrink-0 rounded-full bg-[#4E9D6B]" />
                      <div className="min-w-0 flex-1">
                        <span className="block text-[9px] font-semibold uppercase tracking-[0.14em] text-[#6E6A63]/80 dark:text-neutral-500">
                          Barijera
                        </span>
                        <span className="block text-sm font-medium leading-snug text-[#2B2A28] dark:text-neutral-200">
                          Stabilnija koža
                        </span>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Metric footer */}
              <div className="border-t border-[#ECE0D4]/80 bg-gradient-to-r from-[#FBF6F0]/80 via-[#FFFDFA] to-[#E3F0E6]/30 px-4 py-3 sm:px-5 sm:py-3.5 dark:border-neutral-800 dark:from-neutral-900/80 dark:via-neutral-950 dark:to-neutral-900/80">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-[#4E9D6B]">
                    +28% vidljiv napredak
                  </span>
                  <span className="text-sm font-medium text-[#6E6A63] dark:text-neutral-400">
                    14 dana praćenja
                  </span>
                </div>
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
                className={`px-6 py-6 sm:px-8 sm:py-7${
                  index < benefits.length - 1
                    ? " border-b border-[#ECE0D4] dark:border-neutral-800"
                    : ""
                }`}
              >
                <div className="flex items-start gap-4">
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#F7DECF]/80 bg-[#FBF6F0] text-[#D9734E] dark:border-neutral-700 dark:bg-neutral-900">
                    {benefit.title === "Edukativan pristup" && (
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.75"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M12 4v14.5" />
                        <path d="M12 4C9.5 4 7 5.5 7 8v10.5c0-1.5 2.2-2.5 5-2.5s5 1 5 2.5V8c0-2.5-2.5-4-5-4z" />
                        <path d="M7 8h10" />
                        <path d="M17 3.5l1.2 1.2M17.5 2v2.5" />
                      </svg>
                    )}
                    {benefit.title === "Praćenje napretka" && (
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.75"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <circle cx="5" cy="12" r="2" />
                        <circle cx="12" cy="12" r="2" />
                        <circle cx="19" cy="12" r="2" />
                        <path d="M7 12h3" />
                        <path d="M14 12h3" />
                        <path d="M5 12V8.5" />
                        <path d="M19 12v-2.5" />
                      </svg>
                    )}
                    {benefit.title === "Privatnost podataka" && (
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.75"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M12 3.5 19 6.5v5c0 4.2-2.8 7.2-7 8.5-4.2-1.3-7-4.3-7-8.5v-5L12 3.5z" />
                        <rect x="9" y="11" width="6" height="5" rx="1" />
                        <path d="M11 11V9.5a1 1 0 0 1 2 0V11" />
                      </svg>
                    )}
                  </span>
                  <div>
                    <h3 className="text-base font-semibold tracking-tight text-[#2B2A28] dark:text-neutral-100">
                      {benefit.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-[#6E6A63] dark:text-neutral-400">
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

      {/* SECTION 5 — FINAL CTA */}
      <section className="mx-auto max-w-3xl px-4 pb-24 sm:px-6">
        <div className="overflow-hidden rounded-[32px] border border-[#ECE0D4] bg-[#FFFDFA] px-6 py-12 shadow-[0_2px_4px_rgba(43,42,40,0.03),0_24px_70px_rgba(43,42,40,0.10)] sm:rounded-[36px] sm:px-10 sm:py-16 dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex flex-col items-center text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#E7CDBC] bg-[#FBF6F0]/80 px-4 py-1.5 shadow-[0_1px_2px_rgba(43,42,40,0.04)] backdrop-blur-sm dark:border-neutral-700 dark:bg-neutral-800/70">
              <span className="h-1.5 w-1.5 rounded-full bg-[#D9734E]" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#D9734E]">
                MIRNIJI PRISTUP NJEZI KOŽE
              </span>
            </span>
            <h2 className="mt-7 max-w-lg text-2xl font-semibold leading-[1.15] tracking-tight text-[#2B2A28] sm:text-3xl dark:text-neutral-50">
              Razumij svoju kožu uz AI analizu koja prati promjene kroz vrijeme.
            </h2>
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
                Besplatno • Manje od 60 sekundi • Bez obveze
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#ECE0D4] bg-[#FBF6F0] dark:border-neutral-800 dark:bg-neutral-950">
        <div className="mx-auto max-w-3xl px-6 py-10 sm:py-12">
          <div>
            <p className="text-lg font-semibold tracking-tight text-[#2B2A28] dark:text-neutral-50">
              SkinIntel
            </p>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-[#6E6A63] dark:text-neutral-400">
              AI edukativna analiza kože za praćenje promjena kroz vrijeme.
            </p>
          </div>

          <nav className="mt-8" aria-label="Pravne informacije">
            <ul className="flex flex-col gap-3">
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-[#6E6A63] transition hover:text-[#2B2A28] dark:text-neutral-400 dark:hover:text-neutral-100"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-sm text-[#6E6A63] transition hover:text-[#2B2A28] dark:text-neutral-400 dark:hover:text-neutral-100"
                >
                  Terms of Use
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-sm text-[#6E6A63] transition hover:text-[#2B2A28] dark:text-neutral-400 dark:hover:text-neutral-100"
                >
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/api/delete-request"
                  className="text-sm text-[#6E6A63] transition hover:text-[#2B2A28] dark:text-neutral-400 dark:hover:text-neutral-100"
                >
                  Delete Request
                </Link>
              </li>
            </ul>
          </nav>

          <div className="mt-8">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6E6A63] dark:text-neutral-500">
              Kontakt
            </p>
            <a
              href="mailto:info@skinintel.ai"
              className="mt-2 inline-block text-sm text-[#2B2A28] transition hover:text-[#D9734E] dark:text-neutral-200 dark:hover:text-[#D9734E]"
            >
              info@skinintel.ai
            </a>
          </div>

          <div className="mt-8 flex items-center gap-3">
            <Link
              href="#"
              aria-label="Instagram"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#ECE0D4] bg-[#FFFDFA] text-[#6E6A63] transition hover:border-[#D9734E] hover:text-[#D9734E] dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:border-[#D9734E] dark:hover:text-[#D9734E]"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </Link>
            <Link
              href="#"
              aria-label="Facebook"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#ECE0D4] bg-[#FFFDFA] text-[#6E6A63] transition hover:border-[#D9734E] hover:text-[#D9734E] dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:border-[#D9734E] dark:hover:text-[#D9734E]"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
              </svg>
            </Link>
            <Link
              href="#"
              aria-label="TikTok"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#ECE0D4] bg-[#FFFDFA] text-[#6E6A63] transition hover:border-[#D9734E] hover:text-[#D9734E] dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:border-[#D9734E] dark:hover:text-[#D9734E]"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
              </svg>
            </Link>
            <Link
              href="#"
              aria-label="LinkedIn"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#ECE0D4] bg-[#FFFDFA] text-[#6E6A63] transition hover:border-[#D9734E] hover:text-[#D9734E] dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:border-[#D9734E] dark:hover:text-[#D9734E]"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                <rect x="2" y="9" width="4" height="12" />
                <circle cx="4" cy="4" r="2" />
              </svg>
            </Link>
          </div>

          <p className="mt-8 border-t border-[#ECE0D4] pt-6 text-xs text-[#6E6A63] dark:border-neutral-800 dark:text-neutral-500">
            © 2026 SkinIntel. Sva prava pridržana.
          </p>
        </div>
      </footer>
    </main>
  );
}
