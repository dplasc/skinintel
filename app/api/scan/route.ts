import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const formData = await request.formData();
  const image = formData.get("image");
  const description = formData.get("description");

  return Response.json({
    intro: "Analysis complete",
    assessment: ["Skin input received"],
    top5: [],
    next_steps: ["Review results in dashboard"],
    confidence: "low",
    medical_disclaimer: "This is an educational cosmetic analysis, not a medical diagnosis."
  });
}
