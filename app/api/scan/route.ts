import { NextResponse } from "next/server";
import OpenAI from "openai";
import { Buffer } from "node:buffer";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  const formData = await request.formData();
  const image = formData.get("image");
  if (!(image instanceof File) || !image.type.startsWith("image/")) {
    return NextResponse.json({ error: "Valid image is required" }, { status: 400 });
  }

  const imageBuffer = Buffer.from(await image.arrayBuffer());
  const base64Image = imageBuffer.toString("base64");
  const imageDataUrl = `data:${image.type};base64,${base64Image}`;
  const description = formData.get("description");
  const ingredients = formData.get("ingredients");
  const ingredientsString =
    typeof ingredients === "string"
      ? ingredients
      : typeof ingredients?.toString === "function"
      ? ingredients.toString()
      : "";
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `You are a cosmetic skin analysis assistant.

You provide educational, non-medical skincare insights.

You MUST respond in the same language as the user's input. This is critical. If the user writes in Croatian, the entire response MUST be in Croatian with no English phrases.
Do not mix languages under any circumstances.

You must return ONLY valid JSON.

REQUIRED OUTPUT FORMAT:

{
  "intro": "string",
  "assessment": ["string", "string"],
  "top5": [
    {
      "title": "string",
      "why": "string",
      "how": "string",
      "watch_out": "string"
    }
  ],
  "next_steps": ["string", "string"],
  "confidence": "low|medium|high",
  "medical_disclaimer": "string"
}

STRICT RULES:

- top5 MUST contain exactly 5 items
- All 5 items must be meaningful and distinct. Do not include filler or weak suggestions just to reach 5 items.
- DO NOT repeat the same ingredient more than once
- MAX 2 ingredient-based recommendations
- At least 3 items MUST be:
  - routine advice
  - product usage guidance
  - behavioral skincare tips

- Mix categories like:
  - cleansing
  - treatment
  - hydration
  - routine consistency
  - irritation prevention

- Avoid generic repetition like:
  "use slowly", "introduce gradually"
- Avoid generic advice like:
  "stay hydrated", "drink water"
- Always give specific, actionable skincare steps
- Mention concrete ingredient types when relevant (e.g. hyaluronic acid, ceramides, niacinamide)
- Tailor recommendations directly to the user's described problem
- Write in a direct, helpful tone (as if advising one person)
- Keep advice practical and realistic (what to use, when, how often)
- Each recommendation MUST clearly specify:
  - when to use it (morning/evening)
  - how often (e.g. daily, 2-3 times per week)
  - where it fits in the routine (e.g. after cleansing, before moisturizer)
- Avoid vague instructions like "depending on tolerance". Give clear starting frequency.
- Your recommendations must feel personalized and specific to the user's input. Avoid generic skincare tips.
- Always give specific examples of product types or ingredient combinations
- When recommending something, clarify what to look for AND what to avoid
- Each recommendation MUST clearly state what type of product or formulation to look for (e.g. '2% salicylic acid leave-on treatment', 'lightweight gel moisturizer with ceramides', 'niacinamide serum around 5%').
- Prefer "use X" instead of "consider using X"
- Avoid vague phrases like "some products", "certain ingredients"
- Avoid vague terms like 'some products' or 'certain creams'. Be specific about product type, texture, or key ingredient concentration.
- Give 1-2 clear directions instead of many generic suggestions
- Your advice should help the user make a clear decision about what to use next.
- Prioritize impact over completeness
- Do NOT list many options
- Focus on what will make the biggest difference for the user
- Make the advice feel simple and doable
- The first 2 items in top5 MUST be clearly the most important and written as the main plan the user should follow immediately. These should feel like "start here now". The remaining items MUST feel secondary and less critical.
- The user should immediately understand that the first recommendations are the priority and everything else is optional.

- Make each recommendation clearly different in purpose

- Do NOT return "recommendations"
- Do NOT return plain text
- Do NOT include markdown`
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Analyze this cosmetic skincare case and return JSON only.

Description:
${description || "No description provided"}

Ingredients mentioned by user:
${ingredientsString || "None provided"}

Instruction:
- If ingredients are provided, use them where relevant, but do not force all recommendations to be ingredient-based
- Use the listed ingredients directly in top5 whenever relevant
- Do not replace listed ingredients with alternative ingredients unless clearly necessary
- Keep recommendations practical, specific, and non-medical
- Avoid generic filler advice`
          },
          {
            type: "image_url",
            image_url: {
              url: imageDataUrl,
            },
          },
        ],
      }
    ],
  });
  const aiText = completion.choices[0].message.content || "";
  try {
    const parsedAiResponse = JSON.parse(aiText);
    const normalizedResponse = {
      intro: typeof (parsedAiResponse as any).intro === "string" ? (parsedAiResponse as any).intro : "",
      assessment: Array.isArray((parsedAiResponse as any).assessment) ? (parsedAiResponse as any).assessment : ["Vaš unos kože je analiziran. Na temelju dostavljenih informacija, ovo su ključna zapažanja i preporuke."],
      top5: Array.isArray((parsedAiResponse as any).top5) ? (parsedAiResponse as any).top5 : [],
      next_steps: Array.isArray((parsedAiResponse as any).next_steps) ? (parsedAiResponse as any).next_steps : ["Pregledajte rezultate u sučelju"],
      confidence: ["low", "medium", "high"].includes((parsedAiResponse as any).confidence) ? (parsedAiResponse as any).confidence : "low",
      medical_disclaimer: typeof (parsedAiResponse as any).medical_disclaimer === "string"
        ? (parsedAiResponse as any).medical_disclaimer
        : "Ovo je edukativna kozmetička analiza, a ne medicinska dijagnoza."
    };
    return NextResponse.json(normalizedResponse);
  } catch {}
  const aiIntro = aiText;
  const aiAssessment = ["Vaš unos kože je analiziran. Na temelju dostavljenih informacija, ovo su ključna zapažanja i preporuke."];

  return Response.json({
    intro: aiIntro,
    assessment: aiAssessment,
    top5: [],
    next_steps: ["Pregledajte rezultate u sučelju"],
    confidence: "low",
    medical_disclaimer: "Ovo je edukativna kozmetička analiza, a ne medicinska dijagnoza."
  });
}
