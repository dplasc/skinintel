import { NextResponse } from "next/server";
import OpenAI from "openai";
import { Buffer } from "node:buffer";
import { createClient } from "@supabase/supabase-js";
import { auth } from "@/auth";
import { checkScanRateLimit } from "@/lib/rateLimit";

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function resolveConsentScopes(
  consentMedical: FormDataEntryValue | null,
  consentPrivacy: FormDataEntryValue | null
): string[] {
  const scopes: string[] = [];
  if (consentMedical === "true") {
    scopes.push("cosmetic_analysis_acknowledgement");
  }
  if (consentPrivacy === "true") {
    scopes.push(
      "image_processing_consent",
      "description_processing_consent",
      "evidence_storage_consent",
      "reasoning_consent",
      "retention_tracking_consent"
    );
  }
  return scopes;
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const sessionUserWithId = session.user as { id?: string };
  const userKey = session.user.email ?? sessionUserWithId.id ?? "unknown";
  const rateLimit = await checkScanRateLimit(userKey);
  if (!rateLimit.allowed) {
    return Response.json(
      { error: "Too many scan requests. Please try again later." },
      { status: 429 }
    );
  }

  const formData = await request.formData();
  const consentMedical = formData.get("consentMedical");
  const consentPrivacy = formData.get("consentPrivacy");
  if (consentMedical !== "true" || consentPrivacy !== "true") {
    return Response.json({ error: "Consent required" }, { status: 403 });
  }

  const image = formData.get("image");
  if (!(image instanceof File) || !image.type.startsWith("image/")) {
    return NextResponse.json({ error: "Valid image is required" }, { status: 400 });
  }
  if (image.size > MAX_IMAGE_SIZE_BYTES) {
    return Response.json(
      { error: "Image too large. Please upload an image under 5 MB." },
      { status: 413 }
    );
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error("[scan] failure_stage=scan_record error=missing Supabase configuration");
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
  const userEmail = session.user.email;
  if (!userEmail) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const authenticatedEmail = userEmail;

  const { data: scanRecord, error: scanRecordError } = await supabase
    .from("scan_records")
    .insert([{ user_email: userEmail }])
    .select("id")
    .single();

  if (scanRecordError || !scanRecord) {
    console.error("[scan] failure_stage=scan_record", scanRecordError);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }

  const scanRecordId = scanRecord.id;
  const consentScopes = resolveConsentScopes(consentMedical, consentPrivacy);

  const { data: consentSnapshot, error: consentSnapshotError } = await supabase
    .from("consent_snapshots")
    .insert([
      {
        scan_record_id: scanRecordId,
        user_email: userEmail,
        consent_scopes: consentScopes,
        capture_source: "web_scan",
      },
    ])
    .select("id")
    .single();

  if (consentSnapshotError || !consentSnapshot) {
    console.error(
      "[scan] failure_stage=consent_snapshot scan_record_id=",
      scanRecordId,
      consentSnapshotError
    );
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }

  const descriptionRaw = formData.get("description");
  const trimmedDescription =
    typeof descriptionRaw === "string" ? descriptionRaw.trim() : "";

  if (trimmedDescription.length > 0) {
    const { error: userDescriptionEvidenceError } = await supabase
      .from("user_description_evidence")
      .insert([
        {
          scan_record_id: scanRecordId,
          user_email: userEmail,
          original_text: trimmedDescription,
          capture_source: "web_scan",
          evidence_status: "active",
        },
      ]);

    if (userDescriptionEvidenceError) {
      console.error(
        "[scan] failure_stage=user_description_evidence scan_record_id=",
        scanRecordId,
        userDescriptionEvidenceError
      );
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  }

  const imageBuffer = Buffer.from(await image.arrayBuffer());
  const imageEvidenceId = crypto.randomUUID();
  const ownerSegment = encodeURIComponent(authenticatedEmail.trim().toLowerCase());
  const storageObjectRef = `image-evidence/${ownerSegment}/${scanRecordId}/${imageEvidenceId}`;

  console.info("[scan] image_evidence_upload_start", {
    scanRecordId,
    storageObjectRef,
    contentType: image.type,
    byteSize: image.size,
  });

  const { error: imageEvidenceUploadError } = await supabase.storage
    .from("image-evidence")
    .upload(storageObjectRef, imageBuffer, {
      contentType: image.type,
      upsert: false,
    });

  if (imageEvidenceUploadError) {
    console.error(
      "[scan] failure_stage=image_evidence_upload scan_record_id=",
      scanRecordId,
      imageEvidenceUploadError
    );
    return NextResponse.json(
      {
        error: "Image evidence upload failed",
        failure_stage: "image_evidence_upload",
      },
      { status: 500 }
    );
  }

  console.info("[scan] image_evidence_upload_success", {
    scanRecordId,
    storageObjectRef,
  });

  console.info("[scan] image_evidence_insert_start", {
    scanRecordId,
    imageEvidenceId,
  });

  const { error: imageEvidenceInsertError } = await supabase
    .from("image_evidence")
    .insert([
      {
        id: imageEvidenceId,
        scan_record_id: scanRecordId,
        user_email: userEmail,
        storage_object_ref: storageObjectRef,
        content_type: image.type,
        byte_size: image.size,
        capture_source: "web_scan",
        evidence_status: "active",
      },
    ]);

  if (imageEvidenceInsertError) {
    console.error(
      "[scan] failure_stage=image_evidence scan_record_id=",
      scanRecordId,
      imageEvidenceInsertError
    );
    const { error: cleanupError } = await supabase.storage
      .from("image-evidence")
      .remove([storageObjectRef]);
    if (cleanupError) {
      console.error(
        "[scan] failure_stage=image_evidence_cleanup scan_record_id=",
        scanRecordId,
        cleanupError
      );
    }
    return NextResponse.json(
      {
        error: "Image evidence persistence failed",
        failure_stage: "image_evidence",
      },
      { status: 500 }
    );
  }

  console.info("[scan] image_evidence_insert_success", {
    scanRecordId,
    imageEvidenceId,
  });

  const base64Image = imageBuffer.toString("base64");
  const imageDataUrl = `data:${image.type};base64,${base64Image}`;
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
- Avoid low-value lifestyle advice such as stress reduction, drinking water, or general habits unless directly relevant to the skin condition.
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
- The first 2 items MUST be specific product-based actions, including:
  - product type
  - ingredient concentration (if relevant)
  - clear usage instruction
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
${trimmedDescription || "No description provided"}

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
    const parsedAiResponse = JSON.parse(aiText) as Record<string, unknown>;
    const {
      intro,
      assessment,
      top5,
      next_steps,
      confidence,
      medical_disclaimer,
    } = parsedAiResponse;
    if (
      typeof intro !== "string" ||
      !Array.isArray(assessment) ||
      !Array.isArray(top5) ||
      top5.length !== 5 ||
      !Array.isArray(next_steps) ||
      typeof confidence !== "string" ||
      !["low", "medium", "high"].includes(confidence) ||
      typeof medical_disclaimer !== "string"
    ) {
      console.error(
        "[scan] failure_stage=ai_response_parse scan_record_id=",
        scanRecordId,
        "error=invalid normalized output"
      );
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
    const normalizedResponse = {
      intro,
      assessment,
      top5,
      next_steps,
      confidence,
      medical_disclaimer,
    };
    const { error: persistError } = await supabase.from("analyses").insert([
      {
        user_email: session.user.email,
        result: normalizedResponse,
        confidence: normalizedResponse.confidence,
        consent_medical: true,
        consent_privacy: true,
        model: "gpt-4o-mini",
        scan_record_id: scanRecordId,
      },
    ]);
    if (persistError) {
      console.error(
        "[scan] failure_stage=analyses scan_record_id=",
        scanRecordId,
        persistError
      );
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
    return NextResponse.json(normalizedResponse);
  } catch (parseError) {
    console.error(
      "[scan] failure_stage=ai_response_parse scan_record_id=",
      scanRecordId,
      parseError
    );
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
