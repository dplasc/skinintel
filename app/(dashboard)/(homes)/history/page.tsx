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
    <>
      <div className="mb-6">
        <h6 className="text-2xl font-semibold">Povijest analiza</h6>
      </div>

      {analyses.length === 0 ? (
        <p className="text-sm text-gray-500">Još nema spremljenih analiza.</p>
      ) : (
        <>
          <div className="mb-6 space-y-2 rounded-lg border border-gray-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900">
            <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Sažetak napretka</h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Ukupno analiza: {analyses.length}</p>
            {analyses.length === 1 ? (
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Početak praćenja: {formatCreatedAt(analyses[0]?.created_at)}
              </p>
            ) : (
              <>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Prva analiza: {formatCreatedAt(analyses[analyses.length - 1]?.created_at)}
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Zadnja analiza: {formatCreatedAt(analyses[0]?.created_at)}
                </p>
              </>
            )}
            {analyses.length >= 2 ? (
              <div className="space-y-1 border-t border-gray-200 pt-2 dark:border-neutral-700">
                <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Prije / poslije</h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Najstarija analiza: {formatCreatedAt(analyses[analyses.length - 1]?.created_at)}
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Najnovija analiza: {formatCreatedAt(analyses[0]?.created_at)}
                </p>
                <div className="flex gap-4 pt-1">
                  <Link
                    href={`/history/${analyses[analyses.length - 1]?.id}`}
                    className="text-xs font-medium text-blue-600"
                  >
                    Otvori najstariju
                  </Link>
                  <Link href={`/history/${analyses[0]?.id}`} className="text-xs font-medium text-blue-600">
                    Otvori najnoviju
                  </Link>
                </div>
              </div>
            ) : null}
          </div>
          <div className="space-y-6 border-l border-gray-200 pl-6 dark:border-neutral-700">
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
                  <span className="absolute -left-[30px] top-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-blue-600 dark:border-neutral-900" />
                  <Link href={`/history/${analysis?.id}`} className="block">
                    <p className="text-xs font-medium text-neutral-700 dark:text-neutral-200">{createdAt}</p>
                    <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                      Razina pouzdanosti: {confidence}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-neutral-700 dark:text-neutral-200">
                      {intro}
                    </p>
                    <p className="mt-2 text-xs font-medium text-blue-600">Otvori cijelu analizu</p>
                  </Link>
                </div>
              );
            })}
          </div>
        </>
      )}
    </>
  );
}
