import { auth } from "@/auth";
import { createClient } from "@supabase/supabase-js";
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
  result?: AnalysisResult | null;
};

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
      .select("id, confidence, model, created_at, result")
      .eq("id", id)
      .eq("user_email", session.user.email)
      .single();
    if (error) {
      console.error("History detail fetch failed:", error);
    } else {
      analysis = data ?? null;
    }
  } else {
    console.error("History detail skipped: missing Supabase configuration");
  }

  if (!analysis) {
    return (
      <>
        <div className="mb-6">
          <h6 className="text-2xl font-semibold">Povijest analiza</h6>
        </div>
        <p className="text-sm text-gray-500">Analiza nije pronađena.</p>
      </>
    );
  }

  const createdAt = analysis.created_at ?? "Nepoznat datum";
  const confidence = analysis.confidence ?? "nepoznato";
  const model = analysis.model ?? "nepoznato";
  const result = analysis.result ?? {};
  const intro = typeof result.intro === "string" ? result.intro : "";
  const assessment = Array.isArray(result.assessment) ? result.assessment : [];
  const top5 = Array.isArray(result.top5) ? result.top5 : [];
  const nextSteps = Array.isArray(result.next_steps) ? result.next_steps : [];
  const medicalDisclaimer =
    typeof result.medical_disclaimer === "string" ? result.medical_disclaimer : "";

  return (
    <>
      <div className="mb-6">
        <h6 className="text-2xl font-semibold">Povijest analiza</h6>
        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-500 dark:text-neutral-400">
          <span>{createdAt}</span>
          <span>Razina pouzdanosti: {confidence}</span>
          <span>Model: {model}</span>
        </div>
      </div>

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
    </>
  );
}
