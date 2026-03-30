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
        content: "You are a cosmetic skin analysis assistant. Provide short, educational, non-medical responses."
      },
      {
        role: "user",
        content: `User description: ${description}`
      }
    ],
  });
  const aiText = completion.choices[0].message.content || "";
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
