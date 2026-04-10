"use client";

import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import { getProducts } from "@/lib/getProducts";
import { scoreProduct } from "@/lib/ingredientScoring";
import { useState } from "react";


export default function DashboardPage() {
  const [consentMedical, setConsentMedical] = useState(false);
  const [consentPrivacy, setConsentPrivacy] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [ingredientsInput, setIngredientsInput] = useState("");
  const [scanResult, setScanResult] = useState<any | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [scoredProducts, setScoredProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
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
      setScanError("Morate prihvatiti uvjete prije analize.");
      console.error("CONSENT NOT GIVEN");
      alert("You must accept the required consents before scanning.");
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

      const res = await fetch("/api/scan", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const errorText = await res.text();
        setScanError("Došlo je do greške tijekom analize. Pokušajte ponovno.");
        alert("Scan request failed. Please try again.");
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
      alert("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
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
    alert("Result saved on this device.");
  };
  return (
    <>
      <DashboardBreadcrumb title="SkinIntel" text="SkinIntel" />

      <div className="mt-8 rounded-xl border border-gray-200 bg-gray-50 px-6 py-7 dark:border-neutral-700 dark:bg-neutral-800">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-7 text-left">
          <div className="space-y-2 border-b border-gray-200 pb-5 dark:border-neutral-700">
            <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
              Scan Workspace
            </p>
            <h2 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
              SkinIntel Scan
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-300">
              Upload your photo and add context to receive educational skin insights.
            </p>
          </div>

          <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900">
            <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Scan Inputs</p>
            <input
              type="file"
              accept="image/*"
              onChange={(event) => setImageFile(event.target.files?.[0] || null)}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-neutral-700 dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-200"
            />
            <textarea
              placeholder="Describe your skin issue..."
              rows={4}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-neutral-700 dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-200"
            />
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Optional (for advanced analysis): paste ingredient list from product packaging
            </p>
            <textarea
              placeholder="PASTE INGREDIENTS (INCI) HERE — e.g. niacinamide, salicylic acid, zinc"
              value={ingredientsInput}
              onChange={(e) => setIngredientsInput(e.target.value)}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-neutral-700 dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-200"
            />
            <div className="flex flex-col gap-2 pt-1">
              <label className="flex items-start gap-2 text-sm text-neutral-700 dark:text-neutral-200">
                <input
                  type="checkbox"
                  checked={consentMedical}
                  onChange={(e) => setConsentMedical(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-neutral-900 dark:border-neutral-600"
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
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-neutral-900 dark:border-neutral-600"
                />
                <span>
                  Dajem izričitu privolu za obradu fotografije kože i opisa simptoma u svrhu analize i praćenja napretka.
                </span>
              </label>
            </div>
          </div>
          <button
            type="button"
            onClick={handleScanClick}
            disabled={isLoading || !consentMedical || !consentPrivacy}
            className="w-fit rounded-md bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
          >
            {isLoading ? "Analiza u tijeku..." : "Scan Skin"}
          </button>
          {!consentMedical || !consentPrivacy ? (
            <p className="mt-1 text-sm text-red-500">
              Morate prihvatiti uvjete prije analize.
            </p>
          ) : null}
          {scanError ? (
            <p className="mt-1 text-sm text-red-500">
              {scanError}
            </p>
          ) : null}
          <div className="space-y-3 rounded-lg border border-gray-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900">
            <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Scored Products</h3>
            {scoredProducts.length === 0 ? (
              <div className="text-sm text-neutral-600 dark:text-neutral-300">No matching products found.</div>
            ) : (
              scoredProducts.map((p, i) => (
                <div key={i} className="rounded-md border border-gray-200 px-3 py-2 text-sm text-neutral-700 dark:border-neutral-700 dark:text-neutral-200">
                  <p className="font-medium text-neutral-900 dark:text-neutral-100">
                    {(p.product?.name || p.name || "Unnamed product")}
                    {p.product?.brand ? ` (${p.product.brand})` : p.brand ? ` (${p.brand})` : ""}
                  </p>
                  <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-300">Score: {Math.round(p.score)}</p>
                  {Array.isArray(p.matchedIngredients) && p.matchedIngredients.length > 0 ? (
                    <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-300">
                      Matches: {p.matchedIngredients.join(", ")}
                    </p>
                  ) : null}
                </div>
              ))
            )}
          </div>
          {scanResult ? (
            <div className="space-y-6 rounded-lg border border-gray-200 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-900">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  Scan Result
                </p>
                <button
                  type="button"
                  onClick={handleSaveResult}
                  className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-neutral-700 transition hover:bg-neutral-100 dark:border-neutral-600 dark:text-neutral-200 dark:hover:bg-neutral-800"
                >
                  Save result
                </button>
              </div>
              {intro ? (
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                    Intro
                  </p>
                  <p className="text-sm leading-6 text-neutral-700 dark:text-neutral-200">{intro}</p>
                </div>
              ) : null}
              {assessment && Array.isArray(assessment) ? (
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                    Assessment
                  </p>
                  <ul className="list-disc space-y-2 pl-5 text-sm leading-6 text-neutral-700 dark:text-neutral-200">
                    {assessment.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {top5 && Array.isArray(top5) ? (
                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                    Recommended Focus
                  </p>
                  {top5
                    .filter((item) => item && item.title)
                    .map((item, index) => (
                    <div key={index} className="space-y-2 rounded-md border border-gray-200 p-4 dark:border-neutral-700">
                      <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{item.title}</p>
                      <div className="space-y-1.5">
                        <p className="text-sm leading-6 text-neutral-700 dark:text-neutral-200">{item.why}</p>
                        <p className="text-sm leading-6 text-neutral-700 dark:text-neutral-200">{item.how}</p>
                        <p className="text-sm leading-6 text-neutral-700 dark:text-neutral-200">{item.watch_out}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
              {nextSteps && Array.isArray(nextSteps) ? (
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                    Next Steps
                  </p>
                  <ul className="list-disc space-y-2 pl-5 text-sm leading-6 text-neutral-700 dark:text-neutral-200">
                    {nextSteps.map((step, index) => (
                      <li key={index}>{step}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {confidence ? (
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                    Confidence
                  </p>
                  <p className="text-sm leading-6 text-neutral-700 dark:text-neutral-200">{confidence}</p>
                </div>
              ) : null}
              {medicalDisclaimer ? (
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                    Disclaimer
                  </p>
                  <p className="text-xs leading-5 text-neutral-500 dark:text-neutral-400">{medicalDisclaimer}</p>
                </div>
              ) : null}
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                  What to do next
                </p>
                <ul className="list-disc space-y-2 pl-5 text-sm leading-6 text-neutral-700 dark:text-neutral-200">
                  <li>Start with 1-2 recommended ingredients only</li>
                  <li>Avoid introducing multiple new products at once</li>
                  <li>Track how your skin reacts over the next 7-14 days</li>
                  <li>Repeat scan if condition changes</li>
                </ul>
              </div>
              <div className="mt-1 space-y-1">
                <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                  Tracking your skin
                </p>
                <p className="text-xs leading-5 text-neutral-500 dark:text-neutral-400">
                  Your results can be used to track your skin over time. In future versions, you'll be able to compare scans and monitor progress.
                </p>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}
