# SkinIntel SaaS Blueprint V2

> **STATUS: LOCKED PLANNING DOCUMENT**
> This is a planning and direction document only. It is not implementation.
> It defines the agreed product direction for the next phase of SkinIntel.
> Changes to this document require an explicit decision and a new version bump.
>
> **Scope guardrails (non-negotiable):**
> - No new random features beyond what is defined here.
> - No marketplace. No community. No chat. No social layer.
> - No medical claims, no diagnoses, no "doctor" language.
> - Cosmetic and educational language only.
> - Must stay practical for one founder using AI tools.

---

## 1. Product Vision

SkinIntel is evolving from an AI scan MVP into a full **AI skincare SaaS platform**.

The vision is a personal, private, data-driven skincare companion that helps a user
understand the relationship between **what they put on their skin** (products and
ingredients) and **how their skin behaves over time** (texture, redness, dryness,
oiliness, sensitivity, uneven tone, blemishes).

SkinIntel is positioned as a **cosmetic and educational intelligence tool**, not a
medical product. Its differentiator is the **timeline**: the ability to connect
routines and products to observed skin changes across weeks and months.

Long-term, SkinIntel becomes the place where a user keeps:
- their skin profile,
- their product library and ingredient knowledge (INCI),
- their routine history,
- and a visual progress record (before/after, timeline).

---

## 2. Core Purpose

**SkinIntel helps users understand how their skin reacts to products and ingredients over time.**

Everything in the product must serve this single sentence. If a feature does not help
the user understand the relationship between products/ingredients and skin behavior over
time, it does not belong in SkinIntel.

---

## 3. Target User

**Primary audience: women aged 25–45.**

- They actively use skincare products and care about results.
- They track or want to track routines, products, and progress.
- They are interested in ingredients (INCI) but are often confused by them.
- They value privacy (skin photos are sensitive personal data).

**Men are allowed**, but UX, copy, and positioning focus on skincare users who track
routines, products, and progress. The product is not gender-exclusive, but the design
language and messaging lead with the primary audience.

**Positioning consequence:** clean, calm, trustworthy, premium-feeling UX. Not clinical,
not "medical app". Not a playful gimmick scanner.

---

## 4. SaaS Modules (Locked Product Direction)

These are the locked modules for this phase. No additional modules are introduced.

1. **Skin Profile** — baseline information about the user's skin (type, sensitivities,
   goals, concerns expressed in neutral cosmetic terms).
2. **AI Analysis** — AI-assisted analysis of an uploaded skin image, returning
   observations in neutral cosmetic categories.
3. **Skin Timeline** — chronological view of analyses and observations over time
   (weekly / monthly).
4. **Before / After Comparison** — visual comparison of two points in time (slider).
5. **Product Library** — the user's products plus the global verified product catalog.
6. **INCI Intelligence** — ingredient-level information and education (no medical claims).
7. **Routine Tracker** — what the user uses and when (AM/PM, frequency).
8. **Subscription System** — Free / Pro plans (VIP later), billing via Stripe.
9. **Admin Dashboard** — operational control, verification, monitoring.

---

## 5. Free / Pro / VIP Plan Definition

### Free
- 1 AI skin analysis per month.
- Limited history (recent only, capped retention/visibility window).
- Limited product tracking (small number of saved products).
- No before/after slider.
- No product OCR.

### Pro
- **€6.99 / month** or **€39.99 / year**.
- More analyses per month (limit to be finalized — see Open Decisions).
- Full Skin Timeline.
- Before / After comparison (slider).
- Product OCR (label/INCI extraction from image).
- Routine tracking.
- Full history (no visibility cap).

### VIP
- **Later phase only. Not part of MVP.**
- Reserved for future premium tier (e.g. deeper analysis, priority processing,
  expanded limits). Definition intentionally deferred.

> **Note:** Plan gating must be enforced server-side. The client UI may hide/lock
> features, but entitlement checks for analysis count, OCR, and history access must be
> validated on the backend.

---

## 6. Client Dashboard Structure

The authenticated user dashboard contains:

1. **Overview** — snapshot: plan status, last analysis summary, quick actions.
2. **Latest Analysis** — most recent AI analysis result and observations.
3. **Skin Timeline** — weekly/monthly progression of observations.
4. **My Routine** — current AM/PM routine and tracking.
5. **My Products** — the user's saved products (from library / OCR / manual).
6. **Before / After** — comparison slider (Pro feature).
7. **Subscription** — current plan, upgrade, billing management.
8. **Profile / Settings** — skin profile, account, privacy/consent, data controls.

No other top-level sections are introduced in this phase.

---

## 7. Admin Dashboard Structure

The admin dashboard (internal, founder-only initially) contains:

1. **Users** — accounts, plan, status.
2. **Analyses** — all analyses, status, basic metadata.
3. **Uploaded Images** — references to stored skin/product images (metadata + URLs).
4. **Products** — product catalog management.
5. **INCI Ingredients** — ingredient catalog management.
6. **Verified / Unverified Products** — verification queue and approval.
7. **Subscriptions** — billing/plan state, reconciliation with Stripe.
8. **Consent / Audit Logs** — consent records and important events.
9. **Usage / API Cost Monitoring** — AI/OCR usage and cost tracking.

Admin access must be strictly role-gated and separated from normal user access.

---

## 8. Database Blueprint

> This is a **logical blueprint**, not a migration. Field names are indicative.
> Supabase (Postgres) stores metadata and URLs only — never image binaries.
> RLS must be enabled on all user-owned tables before SaaS launch.

### users / profiles
- `id` (auth user id)
- `email`
- `display_name`
- `plan` (free | pro | vip)
- `skin_type` (neutral cosmetic terms)
- `sensitivities` (neutral terms)
- `goals`
- `created_at`, `updated_at`

### analyses
- `id`
- `user_id` → profiles
- `created_at`
- `status` (pending | processed | failed)
- `summary` (neutral cosmetic summary text)
- `model_version` / `prompt_version`
- `source` (manual upload, etc.)

### analysis_images
- `id`
- `analysis_id` → analyses
- `user_id` → profiles
- `original_url` (private storage reference)
- `optimized_url` (WebP, private storage reference)
- `width`, `height`, `bytes`
- `exif_removed` (boolean)
- `created_at`

### skin_observation_categories
- `id`
- `key` (e.g. redness, texture, dryness, oiliness, sensitivity, uneven_tone, blemishes)
- `label`
- `description` (educational, non-medical)
- (link table) `analysis_observations`: `analysis_id`, `category_id`, `score`/`level`, `notes`

### products
- `id`
- `name`
- `brand`
- `category`
- `inci_available` (boolean)
- `verified` (boolean)
- `source_type` (manual | ocr | catalog | future_web)
- `product_source_url` (nullable)
- `inci_source_url` (nullable)
- `created_by` (user/admin/system)
- `created_at`

### ingredients
- `id`
- `inci_name`
- `common_name` (nullable)
- `function` (cosmetic function, educational)
- `notes` (educational, non-medical)

### product_ingredients
- `id`
- `product_id` → products
- `ingredient_id` → ingredients
- `position` (order on label, if known)

### user_routines
- `id`
- `user_id` → profiles
- `product_id` → products (nullable for free-text)
- `time_of_day` (AM | PM | both)
- `frequency` (daily | weekly | custom)
- `active` (boolean)
- `started_at`, `stopped_at`

### subscriptions
- `id`
- `user_id` → profiles
- `plan` (free | pro | vip)
- `stripe_customer_id`
- `stripe_subscription_id`
- `status` (active | past_due | canceled | trialing)
- `current_period_end`
- `created_at`, `updated_at`

### consents / audit_logs
- **consents:** `id`, `user_id`, `consent_type`, `granted` (boolean), `granted_at`, `revoked_at`
- **audit_logs:** `id`, `user_id` (nullable for system), `action`, `entity`, `entity_id`,
  `metadata` (jsonb), `created_at`

> Existing `interest_leads` table remains untouched by this blueprint.

---

## 9. Image Storage Blueprint

**Principle: Supabase stores metadata and URLs only. Image binaries live in object
storage / Hostinger VPS.**

- Skin images and product images are stored on **Hostinger VPS or object storage**.
- Supabase stores only: storage references (URLs/keys), dimensions, size, flags.
- On upload, each image is processed:
  - **EXIF removed** (privacy — strip location and device metadata).
  - **Converted to WebP** and optimized.
  - Store **original + optimized** versions if architecture allows.
- **Public direct image URLs should be avoided long term.**
  - Prefer signed/expiring URLs or an authenticated proxy.
  - Skin photos are sensitive personal data and must not be openly enumerable.
- Deletion flow must remove both DB references and stored binaries (GDPR alignment).

> Implementation detail (storage provider, signed URL mechanism) is an Open Decision.
> The principle (private by default, metadata-in-Supabase) is locked.

---

## 10. Product + INCI Flow

Goal: build a trustworthy product/ingredient knowledge base while letting users add
products easily.

**Flow:**
1. User can **manually enter INCI** for a product.
2. User can **upload a product/label image**.
3. **AI/OCR extracts** product name and INCI from the label.
4. **If the product exists** in the local database → use local verified data.
5. **If the product does not exist** → create it and mark it **unverified**.
6. **Future phase** may search the internet for product/INCI data and store a
   `source_url` (not in MVP).
7. **Admin verifies** a product before it becomes **global verified data**.

**Rules:**
- No guessing ingredients when INCI is missing (consistent with existing product plan).
- Unverified products are usable by the creating user but not promoted as global truth.
- Verification is the only path from `unverified` → `verified`.
- OCR is a **Pro feature**; manual entry is available more broadly.

---

## 11. AI Analysis Rules

**Hard constraints (compliance-critical):**
- SkinIntel is **not medical software**.
- **No diagnoses.** Never output a medical condition as a label.
- **No "doctor"** language. No claims to treat, cure, or prevent disease.
- **Avoid medical terms as labels:** do not use *acne, dermatitis, eczema, rosacea*
  as diagnosis labels.
- **Use neutral cosmetic terms only:** blemishes, redness, texture, dryness,
  sensitivity, oiliness, uneven tone.

**Output shape:**
- Observations mapped to `skin_observation_categories` (neutral terms).
- Educational, cosmetic framing ("appears", "may benefit from", "consider").
- Optional cosmetic, non-medical suggestions tied to product/ingredient categories.
- Every analysis stores `model_version` / `prompt_version` for traceability.

**Operational:**
- Track token/API cost per analysis (feeds Admin usage/cost monitoring).
- Enforce plan-based analysis limits server-side.
- Store a disclaimer reference with results (non-medical, educational).

---

## 12. Timeline and Before/After Logic

**Timeline:**
- **Weekly and monthly views.**
- Shows progression of observations (per category) over time.
- Associates each period with the **routines/products used during that period**, so the
  user can connect cause (products) to effect (skin behavior).
- Uses stored analyses + observations as the data source.

**Before / After:**
- Visual **slider** comparing two selected analyses/images.
- **Before/After slider is a Pro feature.**
- Comparison respects image privacy rules (signed/proxied URLs, not public).

The timeline is the core value loop: analyze → track routine → observe change → compare.

---

## 13. Subscription / Stripe Direction

- Billing via **Stripe**.
- Plans: **Free** (default), **Pro** (€6.99/mo, €39.99/yr). **VIP later**.
- Stripe is the source of truth for billing state; `subscriptions` table mirrors it.
- **Webhooks** keep `subscriptions.status` and `current_period_end` in sync.
- Entitlements (analysis count, OCR, timeline, before/after, full history) are derived
  from `plan` + `status` and enforced **server-side**.
- Manage-subscription via Stripe Customer Portal where possible (minimize custom billing
  UI for a solo founder).
- Handle the standard states: `active`, `past_due`, `canceled`, `trialing`.

> Trial strategy, proration, and exact Pro analysis limit are Open Decisions.

---

## 14. What is NOT in MVP

Explicitly excluded from this phase:
- **VIP plan** (deferred).
- **Internet product search** with `source_url` auto-population (future phase).
- **Marketplace** of any kind.
- **Community / social features.**
- **Chat / messaging.**
- Any **medical** functionality, diagnosis, or "doctor" feature.
- Native mobile apps (web first).
- Multi-language (unless trivially free) — defer until validated.
- Team/multi-user accounts.

---

## 15. Development Roadmap Phases

> Sequenced for a single founder using AI tools. Each phase should be shippable and
> validated before moving on. Minimal diffs, no scope creep.

**Phase A — Foundation & Auth**
- Stabilize auth, profiles, RLS on user-owned tables.
- Skin Profile basics.

**Phase B — AI Analysis Core**
- Image upload → EXIF strip → WebP optimize → private storage.
- `analyses` + `analysis_images` + observation categories.
- AI analysis with neutral cosmetic output + cost tracking.

**Phase C — History & Timeline**
- Store and display analyses over time (weekly/monthly).
- Latest analysis + overview on dashboard.

**Phase D — Products & INCI**
- Product Library (manual entry first).
- INCI Intelligence (ingredients + product_ingredients).
- Verified/unverified model + admin verification queue.

**Phase E — Routine Tracker**
- `user_routines`, AM/PM, frequency, link to timeline periods.

**Phase F — Monetization (Stripe)**
- Free/Pro plans, Stripe checkout + webhooks + Customer Portal.
- Server-side entitlement enforcement.

**Phase G — Pro Visual Features**
- Before/After slider (Pro).
- Product OCR (Pro).

**Phase H — Admin Hardening & Monitoring**
- Full admin dashboard, consent/audit logs, usage/cost monitoring.

**Phase I — Future (post-MVP)**
- VIP tier, internet product search + source_url, expansions.

---

## 16. Open Decisions

These require a decision before or during the relevant phase. None block this document.

1. **Pro analysis limit** — exact number of analyses/month for Pro.
2. **Free history window** — how much history Free can see (count or time window).
3. **Storage provider** — Hostinger VPS vs dedicated object storage (S3-compatible),
   and the signed-URL / proxy mechanism for private images.
4. **Original image retention** — keep originals or only optimized (cost vs. fidelity).
5. **Trial strategy** — free trial for Pro? length? card required?
6. **OCR provider** — which OCR/vision approach for label extraction, and its cost model.
7. **AI provider/model** — model choice and prompt versioning strategy.
8. **Data retention & deletion** — retention periods and full delete flow (GDPR).
9. **Observation scoring scale** — levels vs numeric scores for categories.
10. **Admin access model** — role flag vs separate admin auth.

---

## 17. Immediate Next Step

**Lock Phase A scope and confirm the Open Decisions that block storage and analysis
(#3 storage provider, #4 original retention).** These two decisions gate the image
pipeline, which is the backbone of AI Analysis, Timeline, and Before/After.

Concretely, the single next step:
> **Decide the image storage architecture (provider + private URL mechanism) so the
> upload → EXIF-strip → WebP → private-store pipeline can be designed without rework.**

No application code, API routes, UI, or database changes are made as part of this
document.
