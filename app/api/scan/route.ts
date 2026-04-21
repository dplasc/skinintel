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

Always respond in the same language as the user's input. If the user writes in Croatian, respond in Croatian. If the user writes in English, respond in English.

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

- Make each recommendation clearly different in purpose

- Do NOT return "recommendations"
- Do NOT return plain text
- Do NOT include markdown`
      },
      {
        role: "user",
        content: `Analyze this cosmetic skincare case and return JSON only.

Description:
${description || "No description provided"}

Ingredients mentioned by user:
${ingredientsString || "None provided"}

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
    const normalizedResponse = {
      intro: typeof (parsedAiResponse as any).intro === "string" ? (parsedAiResponse as any).intro : "",
      assessment: Array.isArray((parsedAiResponse as any).assessment) ? (parsedAiResponse as any).assessment : ["Your skin input has been analyzed. Based on the provided information, here are key observations and recommendations."],
      top5: Array.isArray((parsedAiResponse as any).top5) ? (parsedAiResponse as any).top5 : [],
      next_steps: Array.isArray((parsedAiResponse as any).next_steps) ? (parsedAiResponse as any).next_steps : ["Review results in dashboard"],
      confidence: ["low", "medium", "high"].includes((parsedAiResponse as any).confidence) ? (parsedAiResponse as any).confidence : "low",
      medical_disclaimer: typeof (parsedAiResponse as any).medical_disclaimer === "string"
        ? (parsedAiResponse as any).medical_disclaimer
        : "This is an educational cosmetic analysis, not a medical diagnosis."
    };
    return NextResponse.json(normalizedResponse);
  } catch {}
  const aiIntro = aiText;
  const aiAssessment = ["Your skin input has been analyzed. Based on the provided information, here are key observations and recommendations."];

  return Response.json({
    intro: aiIntro,
    assessment: aiAssessment,
    top5: [],
    next_steps: ["Review results in dashboard"],
    confidence: "low",
    medical_disclaimer: "This is an educational cosmetic analysis, not a medical diagnosis."
  });
}
