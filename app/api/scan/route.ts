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
        content: `Analyze this cosmetic skincare case.

Description:
${description || "No description provided"}

Ingredients mentioned by user:
${formData.get("ingredients") || "None provided"}

Return JSON only in the required structure.

Important:
- Use the user's actual concerns and listed ingredients
- Prioritize ingredient-specific or action-specific recommendations
- Avoid generic category suggestions unless clearly justified by the input
- Make all top5 items distinct and practical`
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
