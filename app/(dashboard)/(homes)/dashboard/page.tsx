"use client";

import { getLatestAnalysis, getReminderPreference, saveReminderPreference } from "@/app/actions";
import { getProducts } from "@/lib/getProducts";
import { scoreProduct } from "@/lib/ingredientScoring";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Fragment, useEffect, useRef, useState } from "react";

type LatestAnalysis = {
  id?: string | number;
  confidence?: string;
  created_at?: string;
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

export default function DashboardPage() {
  const [consentMedical, setConsentMedical] = useState(false);
  const [consentPrivacy, setConsentPrivacy] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [ingredientsInput, setIngredientsInput] = useState("");
  const [scanResult, setScanResult] = useState<any | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [scoredProducts, setScoredProducts] = useState<any[]>([]);
  const [savedScan, setSavedScan] = useState<any | null>(null);
  const [latestAnalysis, setLatestAnalysis] = useState<LatestAnalysis | null>(null);
  const [latestAnalysisTotal, setLatestAnalysisTotal] = useState(0);
  const [latestAnalysisLoaded, setLatestAnalysisLoaded] = useState(false);
  const [reminderDays, setReminderDays] = useState<number | null>(null);
  const [reminderSaved, setReminderSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showSolutionMessage, setShowSolutionMessage] = useState(false);
  const router = useRouter();
  const savedAnalysisRef = useRef<HTMLDivElement | null>(null);
  const ingredientCategoryMap: Record<string, string> = {
    "niacinamide": "active",
    "glycerin": "humectant",
    "salicylic acid": "exfoliant",
    "hyaluronic acid": "humectant",
  };
  const ingredientConcernMap: Record<string, string[]> = {
    "salicylic acid": ["irritation"],
    "alcohol": ["dryness", "irritation"],
    "fragrance": ["sensitivity"],
    "niacinamide": ["sensitivity"],
  };
  const handleScanClick = async () => {
    setScanError(null);
    setScoredProducts([]);
    if (!imageFile) {
      setScanError("Molimo učitajte sliku kože prije analize.");
      alert("Molimo učitajte sliku kože prije analize.");
      return;
    }
    if (!consentMedical || !consentPrivacy) {
      setScanError("Molimo prihvati privole prije pokretanja analize kože.");
      console.error("CONSENT NOT GIVEN");
      alert("Moraš prihvatiti potrebne privole prije analize.");
      return;
    }

    setScanResult(null);
    setIsLoading(true);

    try {
      const formData = new FormData();
      if (imageFile) {
        formData.append("image", imageFile);
      }
      formData.append("description", description);
      formData.append("ingredients", ingredientsInput);
      formData.append("consentMedical", consentMedical ? "true" : "false");
      formData.append("consentPrivacy", consentPrivacy ? "true" : "false");

      const res = await fetch("/api/scan", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const errorText = await res.text();
        setScanError("Došlo je do greške tijekom analize. Pokušajte ponovno.");
        alert("Zahtjev za analizom nije uspio. Pokušaj ponovno.");
        return;
      }

      const data = await res.json();
      const dbProducts = await getProducts();
      const normalizedProducts = dbProducts.map((product: any) => ({
        ...product,
        ingredients: Array.isArray(product.ingredients)
          ? product.ingredients
          : typeof product.ingredients === "string"
            ? product.ingredients.split(",").map((item: string) => item.trim()).filter(Boolean)
            : [],
      }));
      const userIngredients = ingredientsInput
        .split(",")
        .map((i) => i.trim().toLowerCase())
        .filter(Boolean);
      const normalizedUserIngredients = userIngredients.map((i: string) => i.toLowerCase().trim());
      const candidateIngredients = normalizedUserIngredients.map((name) => ({
        name,
        category: ingredientCategoryMap[name] || "unknown",
        concerns: ingredientConcernMap[name] || [],
      }));

      const productScores = normalizedProducts.map((product: any) => {
        const rawIngredients = product.ingredients;
        const safeIngredients = Array.isArray(rawIngredients)
          ? rawIngredients
          : typeof rawIngredients === "string"
            ? rawIngredients.split(",").map((i: string) => i.trim()).filter(Boolean)
            : [];
        const normalizedIngredients = safeIngredients.map((ingredient: string) => {
          const normalizedIngredientName = ingredient.toLowerCase().trim();
          return {
            name: normalizedIngredientName,
            category: ingredientCategoryMap[normalizedIngredientName] || "unknown",
            concerns: ingredientConcernMap[normalizedIngredientName] || [],
          };
        });
        const scoreResult = scoreProduct(candidateIngredients, [normalizedIngredients]);
        const productIngredientNames = new Set(normalizedIngredients.map((ingredient: { name: string; category: string; concerns: string[] }) => ingredient.name));
        const matchedIngredients = candidateIngredients
          .filter((ingredient) => productIngredientNames.has(ingredient.name))
          .map((ingredient) => ingredient.name);
        return {
          ...product,
          score: scoreResult.totalOverlap,
          matchedIngredients,
        };
      });
      const sortedScoredProducts = [...productScores].sort((a, b) => b.score - a.score);
      const filteredProducts = sortedScoredProducts.filter((p) => p.score > 0);
      setScoredProducts(filteredProducts);

      if (
        data &&
        typeof data === "object" &&
        "intro" in data &&
        "assessment" in data &&
        "top5" in data &&
        "next_steps" in data &&
        "confidence" in data &&
        "medical_disclaimer" in data
      ) {
        setScanResult(data);
      } else {
        console.error("INVALID API RESPONSE SHAPE");
      }
    } catch (error) {
      setScanError("Došlo je do greške tijekom analize. Pokušajte ponovno.");
      setScanResult(null);
      setScoredProducts([]);
      console.error("SCAN ERROR:", error);
      alert("Došlo je do greške. Pokušaj ponovno.");
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    const saved = localStorage.getItem("skinintel_last_scan");
    if (!saved) return;
    try {
      setSavedScan(JSON.parse(saved));
    } catch (error) {
      console.error("FAILED TO PARSE SAVED SCAN:", error);
    }
  }, []);
  useEffect(() => {
    if (savedScan) {
      savedAnalysisRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [savedScan]);
  useEffect(() => {
    let active = true;
    getLatestAnalysis()
      .then((data) => {
        if (active) {
          setLatestAnalysis(data?.latest ?? null);
          setLatestAnalysisTotal(data?.total ?? 0);
        }
      })
      .catch((error) => {
        console.error("FAILED TO LOAD LATEST ANALYSIS:", error);
      })
      .finally(() => {
        if (active) {
          setLatestAnalysisLoaded(true);
        }
      });
    return () => {
      active = false;
    };
  }, []);
  useEffect(() => {
    let active = true;
    getReminderPreference()
      .then((data) => {
        if (active && typeof data?.reminderDays === "number") {
          setReminderDays(data.reminderDays);
        }
      })
      .catch((error) => {
        console.error("FAILED TO LOAD REMINDER PREFERENCE:", error);
      });
    return () => {
      active = false;
    };
  }, []);
  const handleReminderChange = async (days: number) => {
    setReminderDays(days);
    setReminderSaved(false);
    try {
      const result = await saveReminderPreference(days);
      if (result?.ok) {
        setReminderSaved(true);
      }
    } catch (error) {
      console.error("FAILED TO SAVE REMINDER PREFERENCE:", error);
    }
  };
  const intro = (scanResult as any)?.intro;
  const assessment = (scanResult as any)?.assessment;
  const top5 = (scanResult as any)?.top5;
  const nextSteps = (scanResult as any)?.next_steps;
  const confidence = (scanResult as any)?.confidence;
  const medicalDisclaimer = (scanResult as any)?.medical_disclaimer;
  const handleSaveResult = () => {
    localStorage.setItem(
      "skinintel_last_scan",
      JSON.stringify({
        savedAt: new Date().toISOString(),
        description,
        ingredientsInput,
        scanResult,
        scoredProducts,
      }),
    );
    alert("Rezultat je spremljen na ovom uređaju.");
    try {
      setSavedScan(JSON.parse(localStorage.getItem("skinintel_last_scan") || "null"));
    } catch (error) {
      console.error("FAILED TO REFRESH SAVED SCAN:", error);
    }
  };
  const handleLoadLastResult = () => {
    const saved = localStorage.getItem("skinintel_last_scan");
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved);
      setScanResult(parsed?.scanResult ?? null);
      setScoredProducts(Array.isArray(parsed?.scoredProducts) ? parsed.scoredProducts : []);
      setDescription(typeof parsed?.description === "string" ? parsed.description : "");
      setIngredientsInput(typeof parsed?.ingredientsInput === "string" ? parsed.ingredientsInput : "");
    } catch (error) {
      console.error("FAILED TO LOAD SAVED SCAN:", error);
    }
  };
  const lastAnalysisDate = latestAnalysis?.created_at
    ? formatCreatedAt(latestAnalysis.created_at).split(" ")[0]
    : null;
  const statCards = [
    {
      label: "Ukupno analiza",
      value: latestAnalysisLoaded ? String(latestAnalysisTotal) : "—",
      hint: "Tvoj dosadašnji napredak",
    },
    {
      label: "Zadnja analiza",
      value: lastAnalysisDate ?? "Još nema",
      hint: lastAnalysisDate ? "Datum zadnje analize" : "Pokreni prvu analizu",
    },
    {
      label: "Razina pouzdanosti",
      value: latestAnalysis?.confidence ?? "—",
      hint: "Iz zadnje analize",
    },
    {
      label: "Podsjetnik",
      value: reminderDays !== null ? `${reminderDays} dana` : "Nije postavljen",
      hint: "Sljedeća analiza",
    },
  ];
  return (
    <>
      <section className="relative overflow-hidden rounded-3xl border border-[#ECE0D4] bg-[#FBF4EC] px-6 py-9 shadow-[0_2px_4px_rgba(43,42,40,0.03),0_18px_50px_rgba(43,42,40,0.09)] sm:rounded-[36px] sm:px-14 sm:py-20 dark:border-neutral-800 dark:bg-neutral-900">
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
          className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[#F3C9B3]/30 blur-3xl sm:-right-20 sm:-top-20 sm:h-72 sm:w-72"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 left-1/3 h-52 w-52 rounded-full bg-[#D9734E]/10 blur-3xl sm:-bottom-28 sm:h-64 sm:w-64"
        />

        <div className="relative max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#E7CDBC] bg-[#FBF6F0]/80 px-3.5 py-1.5 shadow-[0_1px_2px_rgba(43,42,40,0.04)] backdrop-blur-sm dark:border-neutral-700 dark:bg-neutral-800/70">
            <span className="h-1.5 w-1.5 rounded-full bg-[#D9734E]" />
            <span className="bg-gradient-to-r from-[#D9734E] to-[#E0976F] bg-clip-text text-[10px] font-semibold uppercase tracking-[0.28em] text-transparent sm:text-[11px] sm:tracking-[0.32em]">
              AI dnevnik kože
            </span>
          </span>
          <h1 className="mt-5 text-[34px] font-semibold leading-[1.08] tracking-tight text-[#2B2A28] sm:mt-7 sm:text-6xl dark:text-neutral-50">
            Dobrodošla natrag
          </h1>
          <p className="mt-3.5 max-w-xl text-base leading-relaxed text-[#6E6A63] sm:mt-6 sm:text-xl dark:text-neutral-300">
            Prati stanje svoje kože, uspoređuj rezultate i nastavi svoj ritual njege.
          </p>

          <div className="mt-7 flex items-center gap-4 rounded-2xl border border-[#ECE0D4] bg-[#FBF6F0]/90 p-4 shadow-[0_1px_2px_rgba(43,42,40,0.04),0_2px_10px_rgba(43,42,40,0.05)] backdrop-blur-sm sm:mt-9 sm:max-w-sm dark:border-neutral-800 dark:bg-neutral-950/70">
            <span
              aria-hidden="true"
              className="flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-gradient-to-br from-[#F3C9B3]/60 to-[#D9734E]/20 text-lg dark:from-neutral-800 dark:to-neutral-800"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#C45F3D"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 21s-7-4.35-9.33-9.06C1.1 8.86 2.7 5.5 6 5.5c2 0 3.2 1.2 4 2.4.8-1.2 2-2.4 4-2.4 3.3 0 4.9 3.36 3.33 6.44C19 16.65 12 21 12 21z" />
              </svg>
            </span>
            <div className="min-w-0">
              <p className="text-[11px] font-medium uppercase tracking-wide text-[#9A938A] dark:text-neutral-500">
                Zadnja analiza
              </p>
              <p className="mt-0.5 truncate text-sm font-semibold text-[#2B2A28] dark:text-neutral-100">
                {lastAnalysisDate ?? "Još nema analize"}
              </p>
              <p className="mt-0.5 truncate text-xs text-[#6E6A63] dark:text-neutral-400">
                {latestAnalysis?.confidence ?? "Spremno za prvi pregled"}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="mt-6 mb-2 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-[#ECE0D4] bg-[#FBF4EC] p-5 shadow-[0_1px_2px_rgba(43,42,40,0.04),0_2px_10px_rgba(43,42,40,0.05)] transition-shadow hover:shadow-[0_4px_16px_rgba(43,42,40,0.08)] dark:border-neutral-800 dark:bg-neutral-900"
          >
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#D9734E]" />
              <p className="text-xs font-medium uppercase tracking-wide text-[#6E6A63] dark:text-neutral-400">
                {card.label}
              </p>
            </div>
            <p className="mt-3 break-words text-2xl font-semibold leading-tight text-[#2B2A28] dark:text-neutral-100">
              {card.value}
            </p>
            <p className="mt-1 text-xs text-[#9A938A] dark:text-neutral-500">{card.hint}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-[28px] border border-[#ECE0D4] bg-[#FBF6F0] px-6 py-9 sm:px-9 dark:border-neutral-800 dark:bg-neutral-950">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 text-left">
          {savedScan ? (
            <div
              ref={savedAnalysisRef}
              className="rounded-2xl border border-[#ECE0D4] bg-[#FBF4EC] p-6 shadow-[0_1px_2px_rgba(43,42,40,0.04),0_2px_10px_rgba(43,42,40,0.05)] dark:border-neutral-800 dark:bg-neutral-900"
            >
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#D9734E]" />
                <p className="text-xs font-medium uppercase tracking-wide text-[#6E6A63] dark:text-neutral-400">
                  Spremljena analiza
                </p>
              </div>
              <p className="mt-3 text-xl font-semibold tracking-tight text-[#2B2A28] dark:text-neutral-100">
                Imaš spremljenu analizu
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-[#6E6A63] dark:text-neutral-400">
                Tvoja prethodna analiza kože spremna je za pregled. Učitaj je ili nastavi s novom.
              </p>
              <button
                type="button"
                onClick={handleLoadLastResult}
                className="mt-4 inline-flex items-center rounded-xl border border-[#D9734E] px-4 py-2.5 text-sm font-semibold text-[#C45F3D] transition hover:bg-[#F7DECF] active:scale-[0.98] dark:border-[#E8916C] dark:text-[#E8916C] dark:hover:bg-neutral-800"
              >
                Učitaj spremljenu analizu
              </button>
            </div>
          ) : null}
          <div>
            <h3 className="text-xl font-semibold tracking-tight text-[#2B2A28] dark:text-neutral-100">
              Analiza kože
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-[#6E6A63] dark:text-neutral-400">
              Učitaj slike kože i opiši svoje probleme kako bi dobio AI analizu.
            </p>
          </div>

          <div className="space-y-5 rounded-2xl border border-[#ECE0D4] bg-[#FBF4EC] p-6 shadow-[0_1px_2px_rgba(43,42,40,0.04),0_2px_10px_rgba(43,42,40,0.05)] dark:border-neutral-800 dark:bg-neutral-900">
            <p className="text-base font-semibold tracking-tight text-[#2B2A28] dark:text-neutral-100">Detalji o tvojoj koži</p>
            <input
              type="file"
              accept="image/*"
              onChange={(event) => setImageFile(event.target.files?.[0] || null)}
              className="w-full rounded-xl border border-[#ECE0D4] bg-[#FFFDFA] px-4 py-2.5 text-sm text-[#2B2A28] transition placeholder:text-[#9A938A] focus:border-[#D9734E] focus:outline-none focus:ring-2 focus:ring-[#D9734E]/30 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-200"
            />
            <textarea
              placeholder="Opiši probleme, simptome ili promjene koje si primijetio..."
              rows={4}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="w-full rounded-xl border border-[#ECE0D4] bg-[#FFFDFA] px-4 py-2.5 text-sm text-[#2B2A28] transition placeholder:text-[#9A938A] focus:border-[#D9734E] focus:outline-none focus:ring-2 focus:ring-[#D9734E]/30 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-200"
            />
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Opcionalno (za naprednu analizu): zalijepi popis sastojaka s proizvoda
            </p>
            <textarea
              placeholder="ZALIJEPI SASTOJKE (INCI) OVDJE — npr. niacinamid, salicilna kiselina, cink"
              value={ingredientsInput}
              onChange={(e) => setIngredientsInput(e.target.value)}
              className="w-full rounded-xl border border-[#ECE0D4] bg-[#FFFDFA] px-4 py-2.5 text-sm text-[#2B2A28] transition placeholder:text-[#9A938A] focus:border-[#D9734E] focus:outline-none focus:ring-2 focus:ring-[#D9734E]/30 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-200"
            />
            <div className="flex flex-col gap-2 pt-1">
              <label className="flex items-start gap-2 text-sm text-neutral-700 dark:text-neutral-200">
                <input
                  type="checkbox"
                  checked={consentMedical}
                  onChange={(e) => setConsentMedical(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-[#ECE0D4] accent-[#D9734E] transition focus:outline-none focus:ring-2 focus:ring-[#D9734E]/30 dark:border-neutral-600"
                />
                <span>
                  Razumijem da SkinIntel pruža edukativnu kozmetičku analizu, a ne medicinsku dijagnozu.
                </span>
              </label>
              <label className="flex items-start gap-2 text-sm text-neutral-700 dark:text-neutral-200">
                <input
                  type="checkbox"
                  checked={consentPrivacy}
                  onChange={(e) => setConsentPrivacy(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-[#ECE0D4] accent-[#D9734E] transition focus:outline-none focus:ring-2 focus:ring-[#D9734E]/30 dark:border-neutral-600"
                />
                <span>
                  Dajem izričitu privolu za obradu fotografije kože i opisa simptoma u svrhu analize i praćenja napretka.
                </span>
              </label>
              <p className="mt-2 text-xs text-gray-500">
                Više informacija pročitajte u{" "}
                <a href="/privacy" className="underline hover:text-gray-700">
                  Politici privatnosti
                </a>.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleScanClick}
            disabled={isLoading || !consentMedical || !consentPrivacy}
            className="mt-2 w-full rounded-2xl bg-[#D9734E] px-7 py-3.5 text-sm font-semibold text-white shadow-[0_2px_10px_rgba(217,115,78,0.25)] transition duration-200 hover:bg-[#C45F3D] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 sm:w-fit"
          >
            {isLoading ? "Analiza u tijeku..." : "Pokreni analizu kože"}
          </button>
          {!consentMedical || !consentPrivacy ? (
            <div className="mt-1 rounded-xl border border-[#E7D9C4] bg-[#FBF1E3] px-4 py-2.5 text-sm text-[#9A6B2F] dark:border-neutral-800 dark:bg-neutral-900 dark:text-amber-300/80">
              Molimo prihvati privole prije pokretanja analize.
            </div>
          ) : null}
          {scanError ? (
            <div className="mt-1 rounded-xl border border-[#E7D9C4] bg-[#FBF1E3] px-4 py-2.5 text-sm text-[#9A6B2F] dark:border-neutral-800 dark:bg-neutral-900 dark:text-amber-300/80">
              {scanError}
            </div>
          ) : null}
          {latestAnalysisLoaded ? (
            <div className="rounded-2xl border border-[#ECE0D4] bg-[#FBF4EC] p-6 shadow-[0_1px_2px_rgba(43,42,40,0.04),0_2px_10px_rgba(43,42,40,0.05)] dark:border-neutral-800 dark:bg-neutral-900">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#D9734E]" />
                <p className="text-xs font-medium uppercase tracking-wide text-[#6E6A63] dark:text-neutral-400">
                  Zadnja analiza
                </p>
              </div>
              <p className="mt-3 text-sm text-[#6E6A63] dark:text-neutral-400">
                Ukupno analiza:{" "}
                <span className="font-semibold text-[#2B2A28] dark:text-neutral-100">{latestAnalysisTotal}</span>
              </p>
              {latestAnalysis ? (
                <>
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#9A938A] dark:text-neutral-500">
                    <span>{formatCreatedAt(latestAnalysis.created_at)}</span>
                    <span>Razina pouzdanosti: {latestAnalysis.confidence ?? "nepoznato"}</span>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <Link
                      href={`/history/${latestAnalysis.id}`}
                      className="inline-flex items-center rounded-xl bg-[#D9734E] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#C45F3D] active:scale-[0.98]"
                    >
                      Otvori analizu
                    </Link>
                    <Link
                      href="/history"
                      className="inline-flex items-center rounded-xl border border-[#ECE0D4] px-4 py-2 text-xs font-semibold text-[#2B2A28] transition hover:bg-[#F7DECF] active:scale-[0.98] dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
                    >
                      Povijest analiza
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <p className="mt-3 text-sm text-[#6E6A63] dark:text-neutral-400">Još nema spremljenih analiza.</p>
                  <Link
                    href="/dashboard"
                    className="mt-4 inline-flex items-center rounded-xl bg-[#D9734E] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#C45F3D] active:scale-[0.98]"
                  >
                    Pokreni prvu analizu
                  </Link>
                </>
              )}
            </div>
          ) : null}
          <div className="rounded-2xl border border-[#ECE0D4] bg-[#FBF4EC] p-6 shadow-[0_1px_2px_rgba(43,42,40,0.04),0_2px_10px_rgba(43,42,40,0.05)] dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#D9734E]" />
              <p className="text-xs font-medium uppercase tracking-wide text-[#6E6A63] dark:text-neutral-400">
                Podsjetnik za novu analizu
              </p>
            </div>
            <div className="mt-4 flex flex-col gap-2.5">
              {[7, 14, 30].map((days) => (
                <label key={days} className="flex items-center gap-2.5 text-sm text-[#2B2A28] dark:text-neutral-200">
                  <input
                    type="radio"
                    name="reminderDays"
                    value={days}
                    checked={reminderDays === days}
                    onChange={() => handleReminderChange(days)}
                    className="h-4 w-4 border-[#ECE0D4] accent-[#D9734E] transition focus:outline-none focus:ring-2 focus:ring-[#D9734E]/30 dark:border-neutral-600"
                  />
                  <span>{days} dana</span>
                </label>
              ))}
            </div>
            {reminderDays !== null ? (
              <p className="mt-3 text-xs text-[#9A938A] dark:text-neutral-500">
                Trenutno odabrano: {reminderDays} dana
              </p>
            ) : null}
            {reminderSaved ? (
              <p className="mt-2 text-xs font-medium text-[#5C7E59] dark:text-emerald-400/80">Postavka spremljena.</p>
            ) : null}
          </div>
          {scanResult ? (
            <div className="space-y-6 rounded-lg border border-gray-200 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-900">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  Rezultat analize
                </p>
                <button
                  type="button"
                  onClick={handleSaveResult}
                  className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-neutral-700 transition hover:bg-neutral-100 dark:border-neutral-600 dark:text-neutral-200 dark:hover:bg-neutral-800"
                >
                  Spremi rezultat
                </button>
              </div>
              {intro ? (
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                    Uvod
                  </p>
                  <div className="rounded-md bg-gray-50 p-3">
                    <p className="text-sm leading-6 text-neutral-700 dark:text-neutral-200">{intro}</p>
                  </div>
                </div>
              ) : null}
              {assessment && Array.isArray(assessment) && assessment.length > 0 ? (
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
              {top5 && Array.isArray(top5) && top5.length > 0 && top5.some((item) => item && item.title) ? (
                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                    Preporučeni fokus
                  </p>
                  {top5
                    .filter((item) => item && item.title)
                    .map((item, index) => (
                    <Fragment key={index}>
                      <div
                        className={`space-y-2 rounded-md dark:border-neutral-700 ${
                          index < 2 ? "border-2 border-blue-600 bg-blue-50 p-5" : "border border-gray-200 bg-white p-4"
                        }`}
                      >
                        {index < 2 ? (
                          <p className="text-xs font-semibold text-blue-700">
                            GLAVNI KORAK
                          </p>
                        ) : null}
                        <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{item.title}</p>
                        <div className="space-y-1.5">
                          {item.why && item.why.trim() !== "" && (
                            <p className="text-sm leading-6 text-neutral-700 dark:text-neutral-200">
                              <span className="font-medium text-neutral-800 dark:text-neutral-100">Zašto: </span>
                              {item.why}
                            </p>
                          )}
                          {item.how && item.how.trim() !== "" && (
                            <p className="text-sm leading-6 text-neutral-700 dark:text-neutral-200">
                              <span className="font-medium text-neutral-800 dark:text-neutral-100">Kako koristiti: </span>
                              {item.how}
                            </p>
                          )}
                          {item.watch_out && item.watch_out.trim() !== "" && (
                            <p className="text-sm leading-6 text-neutral-700 dark:text-neutral-200">
                              <span className="font-medium text-neutral-800 dark:text-neutral-100">Na što paziti: </span>
                              {item.watch_out}
                            </p>
                          )}
                        </div>
                      </div>
                    </Fragment>
                  ))}
                </div>
              ) : null}
              {nextSteps && Array.isArray(nextSteps) && nextSteps.length > 0 ? (
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
              <div className="mt-3">
                <p className="text-sm text-gray-600">
                  Ako želiš jednostavniji plan, možemo ti pomoći složiti rutinu koja prati tvoje preporuke.
                </p>
                <button
                  type="button"
                  onClick={() => setShowModal(true)}
                  className="mt-2 block text-sm text-blue-600 hover:underline"
                >
                  Saznaj više o rješenju
                </button>
              </div>
              {confidence ? (
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                    Pouzdanost
                  </p>
                  <p className="text-sm leading-6 text-neutral-700 dark:text-neutral-200">{confidence}</p>
                </div>
              ) : null}
              {medicalDisclaimer ? (
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                    Napomena
                  </p>
                  <p className="text-xs leading-5 text-neutral-500 dark:text-neutral-400">{medicalDisclaimer}</p>
                </div>
              ) : null}
              <div className="mt-1 space-y-1">
                <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                  Praćenje kože
                </p>
                <p className="text-xs leading-5 text-neutral-500 dark:text-neutral-400">
                  Rezultati se mogu koristiti za praćenje stanja kože kroz vrijeme.
                </p>
              </div>
            </div>
          ) : null}
          {scanResult ? (
            <div className="space-y-2 rounded-lg border border-gray-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900">
              <p className="text-sm font-medium text-green-600">✓ Analiza spremljena</p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Pregledaj kasnije u Povijesti analiza.
              </p>
              <Link href="/history" className="text-xs font-medium text-blue-600 hover:underline">
                Povijest analiza
              </Link>
            </div>
          ) : null}
          {scoredProducts.length > 0 ? (
            <div className="space-y-3 rounded-lg border border-gray-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900">
              <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Preporučeni proizvodi</h3>
              {scoredProducts.map((p, i) => (
                <div key={i} className="rounded-md border border-gray-200 px-3 py-2 text-sm text-neutral-700 dark:border-neutral-700 dark:text-neutral-200">
                  <p className="font-medium text-neutral-900 dark:text-neutral-100">
                    {(p.product?.name || p.name || "Neimenovani proizvod")}
                    {p.product?.brand ? ` (${p.product.brand})` : p.brand ? ` (${p.brand})` : ""}
                  </p>
                  <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-300">Relevantnost: {Math.round(p.score)}</p>
                  {Array.isArray(p.matchedIngredients) && p.matchedIngredients.length > 0 ? (
                    <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-300">
                      Istaknuti sastojci: {p.matchedIngredients.join(", ")}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          ) : null}
          {showSolutionMessage && (
            <>
              <p className="mt-4 text-sm text-green-600">
                Sljedeći korak je izrada jednostavnijeg rješenja na temelju tvoje analize.
              </p>
              <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">
                Ovo rješenje može biti dostupno kao gotova formulacija prilagođena tvojoj koži.
              </p>
            </>
          )}
        </div>
      </div>
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 text-center shadow-xl">
            <p className="text-lg font-semibold text-neutral-900">Personalizirano rješenje za tvoju kožu</p>
            <p className="mt-2 text-sm text-neutral-700">
              Tvoj rezultat može se pretvoriti u jednostavniju rutinu temeljenu na analizi kože i sastojcima koje si unio/la.
            </p>
            <p className="mt-2 text-sm text-neutral-700">
              Ova rutina temelji se na preporukama koje si upravo dobio/la u analizi.
            </p>
            <p className="mt-2 text-sm text-neutral-700">
              Rutina može kombinirati tretman, hidrataciju i podršku kožnoj barijeri, bez medicinskih tvrdnji ili dijagnoza.
            </p>
            <p className="mt-2 text-sm text-neutral-700">
              U nekim slučajevima, ovakav pristup može se pojednostaviti kroz formulaciju koja kombinira ključne sastojke u jednom proizvodu.
            </p>
            <button
              type="button"
              onClick={() => {
                setShowModal(false);
                router.push("/solution");
              }}
              className="mt-5 w-full rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
            >
              Želim rješenje u jednom proizvodu
            </button>
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="mt-2 rounded-md px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100"
            >
              Zatvori
            </button>
          </div>
        </div>
      )}
    </>
  );
}
