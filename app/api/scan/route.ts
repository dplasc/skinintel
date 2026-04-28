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
- Your recommendations must feel personalized and specific to the user's input. Avoid generic skincare tips.
- Always give specific examples of product types or ingredient combinations
- When recommending something, clarify what to look for AND what to avoid
- Prefer "use X" instead of "consider using X"
- Avoid vague phrases like "some products", "certain ingredients"
- Give 1-2 clear directions instead of many generic suggestions
- Your advice should help the user make a clear decision about what to use next.
- Limit recommendations to the 3 most important actions
- Prioritize impact over completeness
- Do NOT list many options
- Focus on what will make the biggest difference for the user
- Make the advice feel simple and doable
- Give only the top 2-3 most impactful recommendations. Avoid overwhelming the user with too many suggestions.
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
- If ingredients are provided, build the recommendations primarily from those ingredients
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
