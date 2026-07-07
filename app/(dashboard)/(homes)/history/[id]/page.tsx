import { auth } from "@/auth";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { redirect } from "next/navigation";

type Top5Item = {
  title?: string;
  why?: string;
  how?: string;
  watch_out?: string;
};

type AnalysisResult = {
  intro?: string;
  assessment?: string[];
  top5?: Top5Item[];
  next_steps?: string[];
  confidence?: string;
  medical_disclaimer?: string;
};

type AnalysisRow = {
  id?: string | number;
  confidence?: string;
  model?: string;
  created_at?: string;
  scan_record_id?: string | null;
  result?: AnalysisResult | null;
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

export default async function HistoryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.email) {
    redirect("/auth/login");
  }

  const { id } = await params;

  let analysis: AnalysisRow | null = null;
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (supabaseUrl && supabaseServiceRoleKey) {
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
    const { data, error } = await supabase
      .from("analyses")
      .select("id, confidence, model, created_at, scan_record_id, result")
      .eq("id", id)
      .eq("user_email", session.user.email)
      .single();
    if (error) {
      console.error("History detail fetch failed:", error);
    } else if (data) {
      if (data.scan_record_id == null) {
        analysis = data;
      } else {
        const { data: eligibleSession, error: eligibilityError } = await supabase
          .from("eligible_scan_records")
          .select("id")
          .eq("user_email", session.user.email)
          .eq("id", data.scan_record_id)
          .maybeSingle();
        if (eligibilityError) {
          console.error("History detail eligibility fetch failed:", eligibilityError);
        } else if (eligibleSession) {
          analysis = data;
        }
      }
    }
  } else {
    console.error("History detail skipped: missing Supabase configuration");
  }

  if (!analysis) {
    return (
      <div className="rounded-[28px] border border-[#ECE0D4] bg-[#FBF6F0] px-6 py-9 sm:px-9 dark:border-neutral-800 dark:bg-neutral-950">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 text-left">
          <Link
            href="/history"
            className="inline-flex items-center text-sm font-semibold text-[#6E6A63] transition hover:text-[#C45F3D] dark:text-neutral-400 dark:hover:text-[#E8916C]"
          >
            ← Povijest analiza
          </Link>
          <p className="text-sm text-gray-500">Analiza nije pronađena.</p>
        </div>
      </div>
    );
  }

  const createdAt = formatCreatedAt(analysis.created_at);
  const confidence = analysis.confidence ?? "nepoznato";
  const result = analysis.result ?? {};
  const intro = typeof result.intro === "string" ? result.intro : "";
  const assessment = Array.isArray(result.assessment) ? result.assessment : [];
  const top5 = Array.isArray(result.top5) ? result.top5 : [];
  const nextSteps = Array.isArray(result.next_steps) ? result.next_steps : [];
  const medicalDisclaimer =
    typeof result.medical_disclaimer === "string" ? result.medical_disclaimer : "";

  return (
    <div className="rounded-[28px] border border-[#ECE0D4] bg-[#FBF6F0] px-6 py-9 sm:px-9 dark:border-neutral-800 dark:bg-neutral-950">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 text-left">
        <Link
          href="/history"
          className="inline-flex items-center text-sm font-semibold text-[#6E6A63] transition hover:text-[#C45F3D] dark:text-neutral-400 dark:hover:text-[#E8916C]"
        >
          ← Povijest analiza
        </Link>

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
              Rezultat analize
            </h1>
            <p className="mt-3 max-w-xl text-base leading-relaxed text-[#6E6A63] sm:mt-4 dark:text-neutral-300">
              Pregled spremljene AI analize kože.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="inline-flex items-center rounded-full border border-[#ECE0D4] bg-[#FBF6F0]/90 px-3 py-1 text-xs font-semibold text-[#2B2A28] shadow-[0_1px_2px_rgba(43,42,40,0.04)] dark:border-neutral-700 dark:bg-neutral-950/70 dark:text-neutral-100">
                {createdAt}
              </span>
              <span className="inline-flex items-center rounded-full border border-[#E7CDBC] bg-[#FBF6F0]/90 px-3 py-1 text-xs font-semibold text-[#C45F3D] shadow-[0_1px_2px_rgba(43,42,40,0.04)] dark:border-neutral-700 dark:bg-neutral-950/70 dark:text-[#E8916C]">
                Razina pouzdanosti: {confidence}
              </span>
            </div>
          </div>
        </section>

        <div className="space-y-6 rounded-lg border border-gray-200 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-900">
        {intro ? (
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
              Sažetak
            </p>
            <p className="text-sm leading-6 text-neutral-700 dark:text-neutral-200">{intro}</p>
          </div>
        ) : null}

        {assessment.length > 0 ? (
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
              Procjena
            </p>
            <ul className="list-disc space-y-2 pl-5 text-sm leading-6 text-neutral-700 dark:text-neutral-200">
              {assessment
                .filter((item) => typeof item === "string" && item.trim() !== "")
                .map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
            </ul>
          </div>
        ) : null}

        {top5.length > 0 ? (
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
              Glavne preporuke
            </p>
            {top5
              .filter((item) => item && item.title)
              .map((item, index) => (
                <div
                  key={index}
                  className="space-y-2 rounded-md border border-gray-200 bg-white p-4 dark:border-neutral-700"
                >
                  <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    {item.title}
                  </p>
                  <div className="space-y-1.5">
                    {item.why && item.why.trim() !== "" ? (
                      <p className="text-sm leading-6 text-neutral-700 dark:text-neutral-200">
                        <span className="font-medium text-neutral-800 dark:text-neutral-100">
                          Zašto:{" "}
                        </span>
                        {item.why}
                      </p>
                    ) : null}
                    {item.how && item.how.trim() !== "" ? (
                      <p className="text-sm leading-6 text-neutral-700 dark:text-neutral-200">
                        <span className="font-medium text-neutral-800 dark:text-neutral-100">
                          Kako:{" "}
                        </span>
                        {item.how}
                      </p>
                    ) : null}
                    {item.watch_out && item.watch_out.trim() !== "" ? (
                      <p className="text-sm leading-6 text-neutral-700 dark:text-neutral-200">
                        <span className="font-medium text-neutral-800 dark:text-neutral-100">
                          Obrati pažnju:{" "}
                        </span>
                        {item.watch_out}
                      </p>
                    ) : null}
                  </div>
                </div>
              ))}
          </div>
        ) : null}

        {nextSteps.length > 0 ? (
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
              Sljedeći koraci
            </p>
            <ul className="list-disc space-y-2 pl-5 text-sm leading-6 text-neutral-700 dark:text-neutral-200">
              {nextSteps
                .filter((step) => typeof step === "string" && step.trim() !== "")
                .map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
            </ul>
          </div>
        ) : null}

        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            Razina pouzdanosti
          </p>
          <p className="text-sm leading-6 text-neutral-700 dark:text-neutral-200">{confidence}</p>
        </div>

        {medicalDisclaimer ? (
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
              Napomena
            </p>
            <p className="text-xs leading-5 text-neutral-500 dark:text-neutral-400">
              {medicalDisclaimer}
            </p>
          </div>
        ) : null}
        </div>
      </div>
    </div>
  );
}
