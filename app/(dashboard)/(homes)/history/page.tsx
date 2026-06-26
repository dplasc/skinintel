import { auth } from "@/auth";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { redirect } from "next/navigation";

type AnalysisRow = {
  id?: string | number;
  confidence?: string;
  model?: string;
  created_at?: string;
  result?: { intro?: string } | null;
};

function formatCreatedAt(value?: string): string {
  if (!value) return "Nepoznat datum";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Nepoznat datum";
  const parts = new Intl.DateTimeFormat("hr-HR", {
    timeZone: "Europe/Zagreb",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  return `${get("day")}.${get("month")}.${get("year")}. ${get("hour")}:${get("minute")}`;
}

function formatDayGap(newest?: string, oldest?: string): string {
  if (!newest || !oldest) return "Razmak: nije dostupno";
  const newestDate = new Date(newest);
  const oldestDate = new Date(oldest);
  if (Number.isNaN(newestDate.getTime()) || Number.isNaN(oldestDate.getTime())) {
    return "Razmak: nije dostupno";
  }
  const newestDay = Date.UTC(newestDate.getFullYear(), newestDate.getMonth(), newestDate.getDate());
  const oldestDay = Date.UTC(oldestDate.getFullYear(), oldestDate.getMonth(), oldestDate.getDate());
  const days = Math.abs(Math.round((newestDay - oldestDay) / 86400000));
  return `Razmak: ${days} dana`;
}

export default async function HistoryPage() {
  const session = await auth();
  if (!session?.user?.email) {
    redirect("/auth/login");
  }

  let analyses: AnalysisRow[] = [];
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (supabaseUrl && supabaseServiceRoleKey) {
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
    const { data, error } = await supabase
      .from("analyses")
      .select("id, confidence, model, created_at, result")
      .eq("user_email", session.user.email)
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) {
      console.error("History fetch failed:", error);
    } else {
      analyses = data ?? [];
    }
  } else {
    console.error("History skipped: missing Supabase configuration");
  }

  return (
    <div className="rounded-[28px] border border-[#ECE0D4] bg-[#FBF6F0] px-6 py-9 sm:px-9 dark:border-neutral-800 dark:bg-neutral-950">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 text-left">
        <section className="relative overflow-hidden rounded-2xl border border-[#ECE0D4] bg-[#FBF4EC] px-6 py-8 shadow-[0_2px_4px_rgba(43,42,40,0.03),0_18px_50px_rgba(43,42,40,0.09)] sm:rounded-3xl sm:px-8 sm:py-10 dark:border-neutral-800 dark:bg-neutral-900">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 dark:opacity-50"
            style={{
              background:
                "radial-gradient(130% 130% at 0% 0%, #FBF6F0 0%, rgba(251,246,240,0) 55%), radial-gradient(95% 95% at 100% 0%, rgba(217,115,78,0.12) 0%, rgba(217,115,78,0) 48%), radial-gradient(85% 85% at 100% 100%, rgba(243,201,179,0.22) 0%, rgba(243,201,179,0) 52%)",
            }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-[#F3C9B3]/30 blur-3xl sm:-right-16 sm:-top-16 sm:h-52 sm:w-52"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-16 left-1/4 h-36 w-36 rounded-full bg-[#D9734E]/10 blur-3xl sm:-bottom-20 sm:h-44 sm:w-44"
          />

          <div className="relative">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2.5">
              <span className="inline-flex items-center gap-2.5">
                <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-gradient-to-br from-[#D9734E] to-[#E0976F] shadow-[0_2px_8px_rgba(217,115,78,0.3)]">
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-[18px] w-[18px] text-white">
                    <path d="M12 3.2c-3.6 3.8-5.6 6.9-5.6 10.1a5.6 5.6 0 0 0 11.2 0c0-3.2-2-6.3-5.6-10.1Z" fill="currentColor" />
                    <path d="M9.4 13.9c0 1.6 1.1 2.7 2.6 2.9" stroke="#FBF4EC" strokeWidth="1.4" strokeLinecap="round" />
                  </svg>
                </span>
                <span className="text-base font-semibold tracking-tight text-[#2B2A28] dark:text-neutral-100">
                  SkinIntel
                </span>
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-[#E7CDBC] bg-[#FBF6F0]/80 px-3 py-1 shadow-[0_1px_2px_rgba(43,42,40,0.04)] backdrop-blur-sm dark:border-neutral-700 dark:bg-neutral-800/70">
                <span className="h-1.5 w-1.5 rounded-full bg-[#D9734E]" />
                <span className="bg-gradient-to-r from-[#D9734E] to-[#E0976F] bg-clip-text text-[10px] font-semibold uppercase tracking-[0.28em] text-transparent sm:text-[11px] sm:tracking-[0.32em]">
                  AI dnevnik kože
                </span>
              </span>
            </div>
            <h1 className="mt-5 text-[1.65rem] font-semibold leading-[1.12] tracking-tight text-[#2B2A28] sm:text-3xl sm:leading-[1.08] dark:text-neutral-50">
              Povijest analiza
            </h1>
            <p className="mt-3 max-w-xl text-base leading-relaxed text-[#6E6A63] sm:mt-4 dark:text-neutral-300">
              Pregled svih spremljenih analiza i napretka kože kroz vrijeme.
            </p>
          </div>
        </section>

        {analyses.length === 0 ? (
          <p className="text-sm text-gray-500">Još nema spremljenih analiza.</p>
        ) : (
          <>
            <div className="space-y-2 rounded-2xl border border-[#ECE0D4] bg-[#FBF4EC] p-5 shadow-[0_1px_2px_rgba(43,42,40,0.04),0_8px_24px_rgba(43,42,40,0.06)] dark:border-neutral-800 dark:bg-neutral-900">
              <h3 className="text-base font-semibold tracking-tight text-[#2B2A28] dark:text-neutral-100">
                Sažetak napretka
              </h3>
              <p className="text-xs text-[#6E6A63] dark:text-neutral-400">Ukupno analiza: {analyses.length}</p>
              {analyses.length === 1 ? (
                <p className="text-xs text-[#6E6A63] dark:text-neutral-400">
                  Početak praćenja: {formatCreatedAt(analyses[0]?.created_at)}
                </p>
              ) : (
                <>
                  <p className="text-xs text-[#6E6A63] dark:text-neutral-400">
                    Prva analiza: {formatCreatedAt(analyses[analyses.length - 1]?.created_at)}
                  </p>
                  <p className="text-xs text-[#6E6A63] dark:text-neutral-400">
                    Zadnja analiza: {formatCreatedAt(analyses[0]?.created_at)}
                  </p>
                </>
              )}
              {analyses.length >= 2 ? (
                <div className="space-y-1 border-t border-[#ECE0D4] pt-2 dark:border-neutral-700">
                  <h3 className="text-base font-semibold tracking-tight text-[#2B2A28] dark:text-neutral-100">
                    Prije / poslije
                  </h3>
                  <p className="text-xs text-[#6E6A63] dark:text-neutral-400">
                    Najstarija analiza: {formatCreatedAt(analyses[analyses.length - 1]?.created_at)}
                  </p>
                  <p className="text-xs text-[#6E6A63] dark:text-neutral-400">
                    Najnovija analiza: {formatCreatedAt(analyses[0]?.created_at)}
                  </p>
                  <p className="text-xs text-[#6E6A63] dark:text-neutral-400">
                    {formatDayGap(analyses[0]?.created_at, analyses[analyses.length - 1]?.created_at)}
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <Link
                      href={`/history/${analyses[analyses.length - 1]?.id}`}
                      className="inline-flex items-center rounded-lg border border-[#ECE0D4] px-3.5 py-1.5 text-xs font-semibold text-[#2B2A28] transition hover:bg-[#F7DECF] active:scale-[0.98] dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
                    >
                      Otvori najstariju
                    </Link>
                    <Link
                      href={`/history/${analyses[0]?.id}`}
                      className="inline-flex items-center rounded-lg bg-[#D9734E] px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-[#C45F3D] active:scale-[0.98]"
                    >
                      Otvori najnoviju
                    </Link>
                  </div>
                </div>
              ) : null}
            </div>
            <div className="space-y-6 border-l border-[#ECE0D4] pl-6 dark:border-neutral-800">
              {analyses.map((analysis) => {
                const createdAt = formatCreatedAt(analysis?.created_at);
                const confidence = analysis?.confidence ?? "nepoznato";
                const model = analysis?.model ?? "nepoznato";
                const intro =
                  analysis?.result && typeof analysis.result.intro === "string"
                    ? analysis.result.intro
                    : "Sažetak nije dostupan.";
                return (
                  <div key={analysis?.id ?? `${createdAt}-${model}`} className="relative">
                    <span className="absolute -left-[30px] top-5 h-3 w-3 rounded-full border-2 border-[#FBF6F0] bg-[#D9734E] shadow-[0_0_0_1px_#ECE0D4] dark:border-neutral-950 dark:shadow-[0_0_0_1px_#404040]" />
                    <div className="rounded-xl border border-[#ECE0D4] bg-[#FBF6F0]/90 p-4 shadow-[0_1px_2px_rgba(43,42,40,0.04)] backdrop-blur-sm transition-shadow hover:shadow-[0_4px_16px_rgba(43,42,40,0.08)] dark:border-neutral-800 dark:bg-neutral-950/70">
                      <p className="text-xs font-semibold tracking-tight text-[#2B2A28] dark:text-neutral-100">
                        {createdAt}
                      </p>
                      <p className="mt-1 text-xs text-[#6E6A63] dark:text-neutral-400">
                        Razina pouzdanosti: {confidence}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-[#6E6A63] dark:text-neutral-300">
                        {intro}
                      </p>
                      <Link
                        href={`/history/${analysis?.id}`}
                        className="mt-3 inline-flex items-center rounded-lg border border-[#D9734E] px-3.5 py-1.5 text-xs font-semibold text-[#C45F3D] transition hover:bg-[#F7DECF] active:scale-[0.98] dark:border-[#E8916C] dark:text-[#E8916C] dark:hover:bg-neutral-800"
                      >
                        Otvori cijelu analizu
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
