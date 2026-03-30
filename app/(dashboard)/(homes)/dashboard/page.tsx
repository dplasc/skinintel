"use client";

import GenerateContentCard from "@/app/(dashboard)/(homes)/dashboard/components/generate-content-card";
import SalesStaticCard from "@/app/(dashboard)/(homes)/dashboard/components/sales-static-card";
import StatCard from "@/app/(dashboard)/(homes)/dashboard/components/stat-card";
import TabsWithTableCard from "@/app/(dashboard)/(homes)/dashboard/components/tabs-with-table-card";
import TopCountriesCard from "@/app/(dashboard)/(homes)/dashboard/components/top-countries-card";
import TopPerformerCard from "@/app/(dashboard)/(homes)/dashboard/components/top-performer-card";
import TotalSubscriberCard from "@/app/(dashboard)/(homes)/dashboard/components/total-subscriber-card";
import UserOverviewCard from "@/app/(dashboard)/(homes)/dashboard/components/user-overview-card";
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import LoadingSkeleton from "@/components/loading-skeleton";
import { getProducts } from "@/lib/getProducts";
import { scoreProduct } from "@/lib/ingredientScoring";
import { Suspense, useState } from "react";


export default function DashboardPage() {
  const [consentMedical, setConsentMedical] = useState(false);
  const [consentPrivacy, setConsentPrivacy] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [ingredientsInput, setIngredientsInput] = useState("");
  const [scanResult, setScanResult] = useState<any | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [testScore, setTestScore] = useState<any>(null);
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

      const res = await fetch("/api/scan", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        setScanError("Došlo je do greške tijekom analize. Pokušajte ponovno.");
        console.error("SCAN REQUEST FAILED");
        alert("Scan request failed. Please try again.");
        return;
      }

      const data = await res.json();
      setScanResult(data);
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
        const normalizedIngredients = (product.ingredients || []).map((ingredient: string) => {
          const normalizedIngredientName = ingredient.toLowerCase().trim();
          return {
            name: normalizedIngredientName,
            category: ingredientCategoryMap[normalizedIngredientName] || "unknown",
            concerns: ingredientConcernMap[normalizedIngredientName] || [],
          };
        });
        const scoreResult = scoreProduct(candidateIngredients, normalizedIngredients);
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
        const productsIngredientsForScoring = normalizedProducts.map((product: any) =>
          (product.ingredients || []).map((ingredient: string) => {
            const normalizedIngredientName = ingredient.toLowerCase().trim();
            return {
              name: normalizedIngredientName,
              category: ingredientCategoryMap[normalizedIngredientName] || "unknown",
              concerns: ingredientConcernMap[normalizedIngredientName] || [],
            };
          })
        );
        const testResult = scoreProduct(candidateIngredients, productsIngredientsForScoring);
        setTestScore(testResult);
      } else {
        console.error("INVALID API RESPONSE SHAPE");
      }
    } catch (error) {
      setScanError("Došlo je do greške tijekom analize. Pokušajte ponovno.");
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
  return (
    <>
      <DashboardBreadcrumb title="SkinIntel" text="SkinIntel" />

      <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 px-6 py-5 text-center dark:border-neutral-700 dark:bg-neutral-800">
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 text-left">
          <div>
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              SkinIntel Scan
            </h2>
            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">
              Upload your skin photo and describe your issue
            </p>
          </div>
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
          <div className="flex flex-col gap-2">
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
          <button
            type="button"
            onClick={handleScanClick}
            disabled={isLoading || !consentMedical || !consentPrivacy}
            className="w-fit rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white opacity-60 dark:bg-neutral-100 dark:text-neutral-900"
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
          {scanResult ? (
            <div className="rounded-md border border-gray-200 bg-white p-3 dark:border-neutral-700 dark:bg-neutral-900">
              <p className="mb-2 text-sm font-medium text-neutral-900 dark:text-neutral-100">
                Scan result
              </p>
              {intro ? <p className="text-sm text-neutral-700 dark:text-neutral-200">{intro}</p> : null}
              {assessment && Array.isArray(assessment) ? (
                <ul className="mt-2 list-disc pl-5 text-sm text-neutral-700 dark:text-neutral-200">
                  {assessment.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              ) : null}
              {top5 && Array.isArray(top5) ? (
                <div className="mt-2 space-y-2">
                  {top5.map((item, index) => (
                    <div key={index} className="rounded border border-gray-200 p-2 dark:border-neutral-700">
                      <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{item.title}</p>
                      <p className="text-sm text-neutral-700 dark:text-neutral-200">{item.why}</p>
                      <p className="text-sm text-neutral-700 dark:text-neutral-200">{item.how}</p>
                      <p className="text-sm text-neutral-700 dark:text-neutral-200">{item.watch_out}</p>
                    </div>
                  ))}
                </div>
              ) : null}
              {nextSteps && Array.isArray(nextSteps) ? (
                <ul className="mt-2 list-disc pl-5 text-sm text-neutral-700 dark:text-neutral-200">
                  {nextSteps.map((step, index) => (
                    <li key={index}>{step}</li>
                  ))}
                </ul>
              ) : null}
              {confidence ? <p className="mt-2 text-sm text-neutral-700 dark:text-neutral-200">{confidence}</p> : null}
              {medicalDisclaimer ? (
                <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">{medicalDisclaimer}</p>
              ) : null}
            </div>
          ) : null}
          <div>
            <h3>Scored Products</h3>
            {scoredProducts.length === 0 ? (
              <div>No matching products found.</div>
            ) : (
              scoredProducts.map((p, i) => (
                <div key={i}>
                  {(p.product?.name || p.name || "Unnamed product")}
                  {p.product?.brand ? ` (${p.product.brand})` : p.brand ? ` (${p.brand})` : ""} — score: {Math.round(p.score)}
                  {Array.isArray(p.matchedIngredients) && p.matchedIngredients.length > 0 ? (
                    <p className="text-xs text-neutral-600 dark:text-neutral-300">
                      Matches: {p.matchedIngredients.join(", ")}
                    </p>
                  ) : null}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <Suspense fallback={<LoadingSkeleton />}>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5 gap-6">
          <StatCard />
        </div>
      </Suspense>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mt-6">
        <div className="xl:col-span-12 2xl:col-span-6">
          <Suspense fallback={<LoadingSkeleton />}>
            <SalesStaticCard />
          </Suspense>
        </div>

        <div className="xl:col-span-6 2xl:col-span-3">
          <Suspense fallback={<LoadingSkeleton />}>
            <TotalSubscriberCard />
          </Suspense>
        </div>

        <div className="xl:col-span-6 2xl:col-span-3">
          <Suspense fallback={<LoadingSkeleton />}>
            <UserOverviewCard />
          </Suspense>
        </div>

        <div className="xl:col-span-12 2xl:col-span-9">
          <Suspense fallback={<LoadingSkeleton />}>
            <TabsWithTableCard />
          </Suspense>
        </div>

        <div className="xl:col-span-12 2xl:col-span-3">
          <Suspense fallback={<LoadingSkeleton />}>
            <TopPerformerCard />
          </Suspense>
        </div>

        <div className="xl:col-span-12 2xl:col-span-6">
          <Suspense fallback={<LoadingSkeleton />}>
            <TopCountriesCard />
          </Suspense>
        </div>

        <div className="xl:col-span-12 2xl:col-span-6">
          <Suspense fallback={<LoadingSkeleton />}>
            <GenerateContentCard />
          </Suspense>
        </div>
      </div>
    </>
  );
}
