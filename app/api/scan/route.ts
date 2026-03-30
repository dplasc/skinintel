import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  const formData = await request.formData();
  const image = formData.get("image");
  const description = formData.get("description");
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `You are a cosmetic skin analysis assistant.

You provide educational, non-medical insights about skin.

You MUST:
- never provide medical diagnosis
- never use words like disease, treatment, cure
- stay neutral and educational

You MUST ALWAYS return a VALID JSON object with this exact structure:

{
  \"intro\": \"string\",
  \"assessment\": [\"string\"],
  \"top5\": [
    {
      \"title\": \"string\",
      \"why\": \"string\",
      \"how\": \"string\",
      \"watch_out\": \"string\"
    }
  ],
  \"next_steps\": [\"string\"],
  \"confidence\": \"low|medium|high\",
  \"medical_disclaimer\": \"This is an educational cosmetic analysis, not a medical diagnosis.\"
}

CRITICAL RULES:
- top5 MUST contain EXACTLY 5 items
- each item MUST be filled (no empty strings)
- recommendations must be cosmetic (ingredients, routine, habits)
- do NOT return empty arrays
- do NOT return partial JSON
- do NOT include any text outside JSON
`
      },
      {
        role: "user",
        content: `User description: ${description}`
      }
    ],
  });
  const aiText = completion.choices[0].message.content || "";
  try {
    const parsedAiResponse = JSON.parse(aiText);
    return Response.json(parsedAiResponse);
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
