import { auth } from "@/auth";
import { createClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

type AnalysisRow = {
  id?: string | number;
  confidence?: string;
  model?: string;
  created_at?: string;
  result?: { intro?: string } | null;
};

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
        <h6 className="text-2xl font-semibold">History</h6>
      </div>

      {analyses.length === 0 ? (
        <p className="text-sm text-gray-500">No saved analyses yet.</p>
      ) : (
        <div className="space-y-4">
          {analyses.map((analysis) => {
            const createdAt = analysis?.created_at ?? "Unknown date";
            const confidence = analysis?.confidence ?? "unknown";
            const model = analysis?.model ?? "unknown";
            const intro =
              analysis?.result && typeof analysis.result.intro === "string"
                ? analysis.result.intro
                : "No summary available.";
            return (
              <div
                key={analysis?.id ?? `${createdAt}-${model}`}
                className="rounded-lg border border-gray-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900"
              >
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-500 dark:text-neutral-400">
                  <span>{createdAt}</span>
                  <span>Confidence: {confidence}</span>
                  <span>Model: {model}</span>
                </div>
                <p className="mt-2 text-sm leading-6 text-neutral-700 dark:text-neutral-200">
                  {intro}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
