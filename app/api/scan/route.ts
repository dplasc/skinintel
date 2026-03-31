import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  const formData = await request.formData();
  const image = formData.get("image");
  const description = formData.get("description");
  const ingredients = formData.get("ingredients");
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `You are a cosmetic skin analysis assistant.

You provide educational, non-medical skincare guidance based strictly on the user's actual input.

Core rules:
- Do NOT give medical diagnoses
- Do NOT use medical language
- Stay educational, neutral, and cosmetic-focused
- Do NOT give generic skincare advice
- Do NOT give broad category-only recommendations unless tied to the user's input
- Every recommendation must be clearly connected to the user's described concerns or listed ingredients

Output rules:
- Return valid JSON only
- Return ONLY raw JSON
- Do NOT wrap JSON in markdown
- Do NOT use triple backticks
- Do NOT add labels like json
- Do NOT add any text before or after the JSON object
- Follow the required JSON structure exactly
- top5 must contain exactly 5 items

For each top5 item:
- title: must be short, specific, and concrete
- why: must reference the user's actual concerns, symptoms, or listed ingredients
- how: must give practical cosmetic usage guidance in plain language
- watch_out: must include a realistic caution relevant to that recommendation

Recommendation quality rules:
- The user's listed ingredients are the highest priority signal
- At least 3 out of 5 top5 recommendations MUST directly use or reference the user's listed ingredients
- Do NOT ignore user-provided ingredients
- Do NOT replace them with alternative ingredients unless clearly justified
- Only introduce new ingredients if they are strongly complementary to the user's input
- If the user provides ingredients, top5 must be primarily built around those ingredients
- At least 3 of 5 top5 items must directly reference user-provided ingredients when 3 or more ingredients are provided
- When user ingredients are provided, do not replace them with unrelated alternative ingredients
- Only add non-user ingredients if needed to support routine completeness, and keep them lower priority
- If user ingredients are provided, prefer them over general knowledge suggestions
- Prefer ingredient-level or action-level recommendations over vague product-category advice
- Prefer recommendations directly tied to ingredients explicitly mentioned by the user
- Prefer direct actions over broad product categories
- Do NOT include generic items like:
  - cleanser
  - toner
  - moisturizer
  - sunscreen
  unless the user's input clearly justifies them and the explanation is specific
- If a broad category is included, it must be highly specific in title and reasoning
- Prioritize the most relevant 5 recommendations, not the safest generic 5
- Avoid filler such as:
  - 'consider using'
  - 'may help'
  - 'look for products'
  - 'can be beneficial'
  - 'suitable for your skin type'
- Avoid repeating the same idea in multiple top5 items
- If the user mentioned ingredients, use them when relevant
- Make each item distinct and useful

Bad example:
- 'Gentle cleanser'
- 'Non-comedogenic moisturizer'

Better example style:
- 'Niacinamide serum'
- 'Salicylic acid leave-on treatment'
- 'Pause harsh exfoliation'
- 'Barrier-support moisturizer'
- 'Daily SPF 30+'

Always keep the tone practical, specific, and non-medical.`
      },
      {
        role: "user",
        content: `Analyze this cosmetic skincare case and return JSON only.

Description:
${description || "No description provided"}

Ingredients mentioned by user:
${ingredients || "None provided"}

Instruction:
- If ingredients are provided, build the recommendations primarily from those ingredients
- Use the listed ingredients directly in top5 whenever relevant
- Do not replace listed ingredients with alternative ingredients unless clearly necessary
- Keep recommendations practical, specific, and non-medical
- Avoid generic filler advice`
      }
    ],
  });
  const aiText = completion.choices[0].message.content || "";
  try {
    const parsedAiResponse = JSON.parse(aiText);
    const userIngredients = typeof ingredients === "string"
      ? ingredients.split(",").map((i: string) => i.trim().toLowerCase()).filter(Boolean)
      : [];
    const normalizedIngredients = userIngredients.map((i: string) =>
      i.toLowerCase().trim()
    );
    const ingredientTokens = normalizedIngredients.map((ingredient) =>
      ingredient.split(/\s+/)
    );
    let fallbackApplied = false;
    if (
      userIngredients.length >= 3 &&
      parsedAiResponse &&
      typeof parsedAiResponse === "object" &&
      Array.isArray((parsedAiResponse as any).top5)
    ) {
      const matchCount = (parsedAiResponse as any).top5.filter((item: any) => {
        const text = `${item?.title || ""} ${item?.why || ""}`
          .toLowerCase()
          .replace(/[^a-z0-9\s]/g, " ");
        const words = text.split(/\s+/);
        return ingredientTokens.some((tokens) =>
          tokens.every((token) => words.includes(token))
        );
      }).length;
      console.log("INGREDIENT MATCH COUNT:", matchCount);
      console.log("USER INGREDIENTS:", userIngredients);
      console.log("TOP5 TITLES:", (parsedAiResponse as any).top5?.map((item: any) => item.title));
      if (userIngredients.length >= 3 && matchCount < 3) {
        fallbackApplied = true;
        const enforcedItems = userIngredients.slice(0, 3).map((ingredient: string) => ({
          title: `${ingredient} support`,
          why: `This recommendation is based directly on the ingredient you listed: ${ingredient}. It may be relevant to the cosmetic concerns described by the user.`,
          how: "Use this ingredient in a simple, fragrance-free cosmetic product and introduce it slowly into the routine.",
          watch_out: "Avoid combining too many new active products at once, and stop if irritation increases.",
        }));
        const remainingItems = (parsedAiResponse as any).top5;
        (parsedAiResponse as any).top5 = [
          ...enforcedItems,
          ...remainingItems
        ].slice(0, 5);
      }
    }
    const normalizedResponse = {
      intro: typeof (parsedAiResponse as any).intro === "string" ? (parsedAiResponse as any).intro : "",
      assessment: Array.isArray((parsedAiResponse as any).assessment) ? (parsedAiResponse as any).assessment : ["Analysis generated"],
      top5: Array.isArray((parsedAiResponse as any).top5) ? (parsedAiResponse as any).top5 : [],
      next_steps: Array.isArray((parsedAiResponse as any).next_steps) ? (parsedAiResponse as any).next_steps : ["Review results in dashboard"],
      confidence: ["low", "medium", "high"].includes((parsedAiResponse as any).confidence) ? (parsedAiResponse as any).confidence : "low",
      medical_disclaimer: typeof (parsedAiResponse as any).medical_disclaimer === "string"
        ? (parsedAiResponse as any).medical_disclaimer
        : "This is an educational cosmetic analysis, not a medical diagnosis."
    };
    (normalizedResponse as any).debug = {
      intro: normalizedResponse.intro,
      top5_titles: Array.isArray(normalizedResponse.top5)
        ? normalizedResponse.top5.map((item: any) => item.title)
        : [],
      top5_count: Array.isArray(normalizedResponse.top5)
        ? normalizedResponse.top5.length
        : 0,
      fallback_applied: fallbackApplied,
      top5_titles_text: Array.isArray(normalizedResponse.top5)
        ? normalizedResponse.top5.map((item: any) => item.title).join(" | ")
        : ""
    };
    console.log("FINAL RESPONSE INTRO:", normalizedResponse.intro);
    console.log("FINAL RESPONSE TOP5 TITLES:", normalizedResponse.top5?.map((item: any) => item.title));
    console.log("FINAL RESPONSE TOP5 COUNT:", normalizedResponse.top5?.length);
    return Response.json(normalizedResponse);
  } catch {}
  const aiIntro = aiText;
  const aiAssessment = ["Analysis generated"];

  return Response.json({
    intro: aiIntro,
    assessment: aiAssessment,
    top5: [],
    next_steps: ["Review results in dashboard"],
    confidence: "low",
    medical_disclaimer: "This is an educational cosmetic analysis, not a medical diagnosis."
  });
}
