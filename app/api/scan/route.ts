import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const formData = await request.formData();
  const image = formData.get("image");
  const description = formData.get("description");

  return Response.json({
    intro: "Test scan response",
    assessment: ["Skin input received successfully"],
    top5: [
      {
        title: "Test recommendation",
        why: "Because matching logic is being tested",
        how: "Use as a placeholder result",
        watch_out: "This is not a final AI recommendation"
      }
    ],
    next_steps: ["Continue testing the dashboard flow"],
    confidence: "low",
    medical_disclaimer: "This is an educational cosmetic analysis, not a medical diagnosis."
  });
}
