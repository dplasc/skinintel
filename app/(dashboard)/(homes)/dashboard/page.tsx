"use client";

import { getProducts } from "@/lib/getProducts";
import { scoreProduct } from "@/lib/ingredientScoring";
import { Fragment, useEffect, useRef, useState } from "react";


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
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
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
  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h6 className="text-2xl font-semibold">Radni prostor za analizu kože</h6>
          <p className="mt-1 text-sm text-gray-500">
            Pregledaj svoju spremljenu analizu ili pokreni novu.
          </p>
        </div>
      </div>

      <div className="mt-8 rounded-xl border border-gray-200 bg-gray-50 px-6 py-7 dark:border-neutral-700 dark:bg-neutral-950">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-7 text-left">
          {savedScan ? (
            <>
              <p className="text-lg font-semibold text-neutral-900">Dobrodošao natrag</p>
              <p className="mt-1 mb-3 text-sm text-gray-500">Tvoja prethodna analiza kože spremna je za pregled.</p>
              <div ref={savedAnalysisRef} className="rounded-md border border-blue-200 bg-blue-50 p-3 dark:border-blue-900 dark:bg-blue-950">
                <p className="text-sm font-medium text-neutral-800 dark:text-neutral-100">
                  Imaš spremljenu analizu
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  Učitaj prethodnu analizu ili nastavi s novom.
                </p>
                <button
                  type="button"
                  onClick={handleLoadLastResult}
                  className="mt-3 rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-neutral-700 transition hover:bg-neutral-100 dark:border-neutral-600 dark:text-neutral-200 dark:hover:bg-neutral-700"
                >
                  Učitaj spremljenu analizu
                </button>
              </div>
            </>
          ) : null}
          <h3 className="mb-4 text-xl font-semibold text-neutral-900 dark:text-neutral-100">
            Analiza kože
          </h3>
          <p className="mb-4 text-sm text-gray-500 dark:text-neutral-400">
            Učitaj slike kože i opiši svoje probleme kako bi dobio AI analizu.
          </p>

          <div className="space-y-4 rounded-lg border border-gray-300 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-neutral-700 dark:bg-neutral-900">
            <p className="text-base font-medium tracking-tight text-neutral-900 dark:text-neutral-100">Detalji o tvojoj koži</p>
            <input
              type="file"
              accept="image/*"
              onChange={(event) => setImageFile(event.target.files?.[0] || null)}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-neutral-700 transition focus:outline-none focus:ring-2 focus:ring-neutral-300 dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-200"
            />
            <textarea
              placeholder="Opiši probleme, simptome ili promjene koje si primijetio..."
              rows={4}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-neutral-700 transition focus:outline-none focus:ring-2 focus:ring-neutral-300 dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-200"
            />
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Opcionalno (za naprednu analizu): zalijepi popis sastojaka s proizvoda
            </p>
            <textarea
              placeholder="ZALIJEPI SASTOJKE (INCI) OVDJE — npr. niacinamid, salicilna kiselina, cink"
              value={ingredientsInput}
              onChange={(e) => setIngredientsInput(e.target.value)}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-neutral-700 transition focus:outline-none focus:ring-2 focus:ring-neutral-300 dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-200"
            />
            <div className="flex flex-col gap-2 pt-1">
              <label className="flex items-start gap-2 text-sm text-neutral-700 dark:text-neutral-200">
                <input
                  type="checkbox"
                  checked={consentMedical}
                  onChange={(e) => setConsentMedical(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-neutral-900 transition focus:outline-none focus:ring-2 focus:ring-neutral-300 dark:border-neutral-600"
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
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-neutral-900 transition focus:outline-none focus:ring-2 focus:ring-neutral-300 dark:border-neutral-600"
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
            className="mt-4 w-fit rounded-md bg-blue-700 px-6 py-3 text-sm font-semibold text-white transition duration-200 hover:scale-[1.02] hover:bg-blue-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Analiza u tijeku..." : "Pokreni analizu kože"}
          </button>
          {!consentMedical || !consentPrivacy ? (
            <p className="mt-1 text-sm text-red-500">
              Molimo prihvati privole prije pokretanja analize.
            </p>
          ) : null}
          {scanError ? (
            <p className="mt-1 text-sm text-red-500">
              {scanError}
            </p>
          ) : null}
          <div className="space-y-3 rounded-lg border border-gray-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900">
            <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Preporučeni proizvodi</h3>
            {scoredProducts.length === 0 ? (
              <div className="text-sm text-gray-500">Nema pronađenih proizvoda. Pokušaj dodati više detalja ili sastojaka.</div>
            ) : (
              scoredProducts.map((p, i) => (
                <div key={i} className="rounded-md border border-gray-200 px-3 py-2 text-sm text-neutral-700 dark:border-neutral-700 dark:text-neutral-200">
                  <p className="font-medium text-neutral-900 dark:text-neutral-100">
                    {(p.product?.name || p.name || "Neimenovani proizvod")}
                    {p.product?.brand ? ` (${p.product.brand})` : p.brand ? ` (${p.brand})` : ""}
                  </p>
                  <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-300">Rezultat: {Math.round(p.score)}</p>
                  {Array.isArray(p.matchedIngredients) && p.matchedIngredients.length > 0 ? (
                    <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-300">
                      Podudaranja: {p.matchedIngredients.join(", ")}
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
              {assessment && Array.isArray(assessment) ? (
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                    Procjena
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
                          <p className="text-sm leading-6 text-neutral-700 dark:text-neutral-200">{item.why}</p>
                          <p className="text-sm leading-6 text-neutral-700 dark:text-neutral-200">{item.how}</p>
                          <p className="text-sm leading-6 text-neutral-700 dark:text-neutral-200">{item.watch_out}</p>
                        </div>
                      </div>
                      {index === 1 ? (
                        <div className="mt-3">
                          <p className="text-sm text-gray-600">
                            Ako želiš jednostavnije rješenje, postoji formulacija koja kombinira hidrataciju i obnovu kože u jednom proizvodu, bez potrebe za više koraka.
                          </p>
                          <button
                            type="button"
                            onClick={() => setShowModal(true)}
                            className="mt-2 block text-sm text-blue-600 hover:underline"
                          >
                            Saznaj više o rješenju
                          </button>
                        </div>
                      ) : null}
                    </Fragment>
                  ))}
                </div>
              ) : null}
              {nextSteps && Array.isArray(nextSteps) ? (
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                    Sljedeći koraci
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
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                  Tvoji sljedeći koraci
                </p>
                <ul className="list-disc space-y-2 pl-5 text-sm leading-6 text-neutral-700 dark:text-neutral-200">
                  <li>Započni s 1-2 preporučena sastojka</li>
                  <li>Izbjegavaj uvođenje više novih proizvoda odjednom</li>
                  <li>Prati kako koža reagira tijekom sljedećih 7-14 dana</li>
                  <li>Ponovi analizu ako se stanje promijeni</li>
                </ul>
              </div>
              <div className="mt-1 space-y-1">
                <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                  Praćenje kože
                </p>
                <p className="text-xs leading-5 text-neutral-500 dark:text-neutral-400">
                  Rezultati se mogu koristiti za praćenje stanja kože kroz vrijeme. U budućim verzijama moći ćeš uspoređivati analize i pratiti napredak.
                </p>
              </div>
            </div>
          ) : null}
        </div>
      </div>
      {showModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 text-center shadow-xl">
            <p className="text-lg font-semibold text-neutral-900">U razvoju</p>
            <p className="mt-2 text-sm text-neutral-700">
              Radimo na personaliziranom rješenju za tvoju kožu. Uskoro dostupno.
            </p>
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="mt-4 rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
            >
              Zatvori
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
