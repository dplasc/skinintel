# SkinIntel Master Blueprint V2

> **STATUS: OFFICIAL SOURCE OF TRUTH (V2)**
> This document consolidates all locked architectural decisions for SkinIntel into one
> founder/CTO blueprint. It supersedes scattered notes and merges the locked directions:
> Product Vision, Database Blueprint, Client Dashboard, Image Storage, OCR + INCI,
> Admin Dashboard, Subscription + Stripe, and Premium UX.
>
> **This document consolidates existing decisions only — no new features or ideas.**
> Companion document: `docs/SKININTEL_SAAS_BLUEPRINT_V2.md` (original locked blueprint).
> Changes require an explicit decision and a version bump.
>
> **Permanent guardrails (non-negotiable):**
> - SkinIntel is **not medical software**. No diagnoses, no "doctor", no treatment claims.
> - Cosmetic and educational language only.
> - No marketplace. No community. No chat. No social layer.
> - No dark patterns. Honest cancellation. Stripe is the source of truth for billing.
> - Must stay practical for one founder using AI tools.

---

## 1. Executive Summary

SkinIntel is evolving from an AI scan MVP into a **premium AI skincare SaaS platform**.
Its defensible value is **time**: a single AI scan is a commodity, but a *trend* —
connecting products and ingredients to how a user's skin behaves over weeks and months —
is the moat.

The platform is built around eight locked modules (Skin Profile, AI Analysis, Skin
Timeline, Before/After, Product Library, INCI Intelligence, Routine Tracker,
Subscription) plus an Admin operations layer. It runs on Next.js (Vercel) with Supabase
for metadata and Hostinger VPS / object storage for images.

The product is positioned as **calm, premium self-care** for women 25–45, monetized via a
clean freemium model (Free with a monthly reset, Pro at €6.99/mo or €39.99/yr), with
Stripe as the sole billing authority. Every architectural decision optimizes for three
things: **trust** (sensitive face data, privacy-first), **data quality** (a
human-verified product/ingredient catalog flywheel), and **solo-founder operability**.

The two irreversible decision clusters that gate everything: **(1)** the privacy-critical,
provider-agnostic image pipeline, and **(2)** the single server-side entitlement model
with Stripe as source of truth.

---

## 2. Product Vision

A personal, private, data-driven skincare companion that helps a user understand the
relationship between **what they put on their skin** (products and ingredients) and
**how their skin behaves over time** (texture, redness, dryness, oiliness, sensitivity,
uneven tone, blemishes).

SkinIntel is a **cosmetic and educational intelligence tool**, not a medical product.
Long-term it becomes the place where a user keeps their skin profile, product library and
ingredient knowledge, routine history, and a visual progress record (timeline,
before/after).

---

## 3. Core User Problem

1. Users don't know how their skin reacts to specific products/ingredients over time.
2. They can't easily read or understand INCI ingredient lists.
3. They lack a trustworthy, private way to track skin progress and connect it to cause
   (routines/products) and effect (skin behavior).

**Core purpose (the one sentence everything serves):**
**SkinIntel helps users understand how their skin reacts to products and ingredients over time.**

---

## 4. Target User

**Primary audience: women aged 25–45.**
- Actively use skincare and care about results.
- Want to track routines, products, and progress.
- Interested in ingredients but confused by them.
- Value privacy (skin photos are sensitive personal data).

**Men are allowed**, but UX, copy, and positioning lead with the primary audience.
**Positioning consequence:** clean, calm, trustworthy, premium-feeling UX — not clinical,
not a gimmick scanner.

---

## 5. Product Philosophy

- **Progress over data.** Show direction (calmer, more even), not raw numbers.
- **One question per screen.** Each surface answers exactly one thing.
- **Reassurance is the product.** Reduce anxiety; never amplify it.
- **Effort is the enemy.** Reduce input friction toward zero (OCR over typing).
- **Trust is earned through verification**, not asserted (verified vs unverified data).
- **Ingredients only matter in context** — correlated to the user's own timeline.
- **Least privilege + full audit** for everything touching sensitive data.
- **Stripe owns money; SkinIntel owns access.**
- **Built for one founder first** — lean, high-leverage, no feature soup.

---

## 6. SaaS Modules (Locked)

1. **Skin Profile** — baseline skin info (type, sensitivities, goals) in neutral terms.
2. **AI Analysis** — AI-assisted analysis of a skin image → neutral cosmetic observations.
3. **Skin Timeline** — weekly/monthly progression of observations over time.
4. **Before / After Comparison** — visual slider between two points in time (Pro).
5. **Product Library** — user's products + global verified catalog.
6. **INCI Intelligence** — ingredient education (cosmetic, non-medical), as a layer.
7. **Routine Tracker** — AM/PM routines + frequency + adherence logging.
8. **Subscription System** — Free / Pro (VIP later), billing via Stripe.
9. **Admin Dashboard** — operations, verification, monitoring, compliance.

No additional modules are introduced in this phase.

---

## 7. Database Blueprint Summary

> Logical model only. Supabase (Postgres) stores **metadata and URLs only** — never image
> binaries. RLS enabled on all user-owned tables before SaaS launch.

**Core entities (from the locked Database Blueprint, including reviewed additions):**

- **Identity/access:** `profiles`, `roles`/`admin_users`.
- **Subscriptions/entitlements:** `plans`, `plan_entitlements`, `subscriptions`,
  `subscription_events` (webhook log), `usage_counters` (per user/period).
- **Analysis/observations:** `analyses` (with `model_version`/cost), `analysis_images`,
  `skin_observation_categories`, `analysis_observations` (FK + unique per analysis×category).
- **Timeline/comparison:** `routine_logs` (per-period adherence), `before_after_pairs`.
- **Products/ingredients:** `products` (verified flag, `verified_by`/`verified_at`,
  `source_type`, `created_by`), `user_products` (personal library), `ingredients`,
  `ingredient_aliases`, `product_ingredients`, `product_images`, `ocr_jobs`.
- **Compliance:** `consents` (with `policy_version`), `audit_logs` (actor type),
  `data_deletion_requests`.

**Locked data principles:**
- One **derived effective plan/entitlement** per user (single source of truth).
- Provider-agnostic `storage_key` + `provider` on every image record.
- Soft-delete (`deleted_at`) vs GDPR hard-delete clearly separated.
- Indexing intent locked for: `analyses(user_id, created_at)`, observations uniqueness,
  product/ingredient dedup, `subscriptions`/`usage_counters` lookups, audit queries.
- Existing `interest_leads` table remains untouched.

---

## 8. Image Architecture Summary

> Images are sensitive PII. Supabase stores metadata; bytes live on Hostinger VPS /
> object storage. Private by default, provider-agnostic, deletion is first-class.

- **Three categories, hard-separated:** skin photos (highest sensitivity), product photos,
  product label photos (OCR, transient).
- **Opaque, non-sequential keys** organized `category / user-prefix / entity / variant`.
  No guessable paths; per-user prefix enables one-sweep GDPR deletion.
- **No persistent public URLs.** Skin photos served via **authenticated proxy** (or very
  short signed URLs); product/label via short-expiry signed URLs.
- **Ingest pipeline:** validate → **strip EXIF** (unconditional) → **convert to WebP** +
  optimize → generate thumbnail → store variants → write metadata.
- **Retention:** keep **skin originals** (configurable, enables future re-analysis);
  **purge label originals fast** (durable asset = OCR result, not pixels); product
  originals optional.
- **Deletion:** soft-delete → verified byte-purge (`purged_at` proof) + orphan
  reconciliation. GDPR deletion = tracked, verifiable, per-user sweep across DB,
  off-DB storage, and bounded backups.
- **Migration:** DB never stores provider URLs, so VPS → object storage is a config flip.

---

## 9. OCR + INCI Architecture Summary

> Make ingredients legible with near-zero effort, feed the timeline, and keep a clean,
> human-verified catalog. All ingredient content is **cosmetic/educational, never medical**.

- **Input funnel (least → most effort):** search verified catalog → **photograph label
  (OCR)** → photograph product front (optional) → manual entry/correction (always
  available, never a hard block).
- **OCR pipeline:** capture → pre-process → **vision LLM (GPT-4o-class) transcribes &
  structures** the printed label into ordered INCI with per-field confidence. The model
  **transcribes what is printed — it never invents or recalls ingredients.** Stores
  `model_version`/`prompt_version` and per-product cost.
- **Extraction/validation:** tokenize (preserve order) → normalize → **match against
  canonical ingredient vocabulary + alias table** (exact/fuzzy) → match or flag. No
  auto-promotion of guesses.
- **Aliases are foundational:** canonical ingredient ↔ synonyms (INCI/common-name,
  languages, OCR misreads). Everything resolves to one canonical identity.
- **Trust tiers:** **verified** (admin-confirmed, global truth) / **unverified** (user
  draft, usable by submitter, labeled, not global) / **provisional ingredients**.
- **Verification:** AI proposes, **admin promotes**. Merge/dedup is first-class. OCR
  corrections feed the alias table (learning loop).
- **Correlation:** product-to-skin correlation is **observational and hedged** (temporal,
  never causal/medical). **Product-level in MVP; ingredient-level post-MVP.**

---

## 10. Client Dashboard Blueprint

> Trend-first, not scan-first. The dashboard is a mirror that answers "how is my skin, and
> why?" Calm, premium, one focus per screen.

**Navigation — 5 destinations max:** Home (Skin Status) · Timeline (contains Before/After
as a mode) · Routine · Products (INCI as a contextual layer) · Profile (menu).
AI Analysis is an **action** (CTA); Subscription is **contextual**; INCI is a **layer** —
none are top-level tabs.

**Homepage (above the fold):** Skin Status hero (one human sentence + trend direction) →
single context-aware CTA → mini-trend strip. Below: latest analysis summary, routine
adherence nudge, the **cause→effect insight card** (flagship value block), upgrade card
(Free only).

**Timeline:** weekly + monthly views; vertical journal of snapshots linking
skin changes to routines/products in each period. Trend mode (gentle visuals) + visual
mode (photos + before/after). Free = truncated; Pro = full history (the natural paywall).

**Before/After:** satisfying slider reveal, smart default pairing + manual pairing, lives
in Timeline, **Pro feature**, private by default, cosmetic framing only.

**Products:** "My Products" (personal) vs global catalog; INCI explained in plain language
on tap; OCR add (Pro).

**Routine:** AM/PM ordered steps; one-tap daily logging (optional, non-judgmental);
adherence feeds the timeline correlation.

**Retention loops:** weekly (scan + log → fresh timeline chapter) and monthly (Monthly
Skin Recap → progress payoff + upgrade moment).

**Charts:** max 3 types — sparklines, one trend chart, a soft adherence calendar/heatmap.
No vanity "skin score," no clinical charts.

---

## 11. Admin Dashboard Blueprint

> A lean, heavily-audited, least-privilege operations tool for a solo founder. Three
> high-leverage workflows: verification, cost-vs-revenue, compliant deletion.

**Homepage cockpit:** "needs attention" queue (verification, OCR drafts, **GDPR deletion
requests with SLA**, flagged images, failures) · business health (MRR, Free/Pro split,
**AI/OCR/storage cost vs revenue = margin per user**) · operational metrics · security
metrics (sensitive-access log).

**MVP modules:** Verification Queue (products + OCR + ingredients), Users, Compliance
(consents + deletion + audit), Subscriptions (read + reconcile), basic Cost/Usage.
**Later:** image moderation (reactive/flag-based), analysis review, platform health,
multi-admin roles.

**Workflows:**
- **Product verification:** impact-ordered queue; confirm/correct/**merge**/reject with
  reason and audit; AI proposes, admin promotes.
- **OCR review:** draft vs label image side-by-side, low-confidence highlighted;
  corrections feed aliases.
- **Ingredient management:** canonical vocabulary + alias curation; non-medical content.
- **User management:** view + support; **PII/skin-photo access gated and logged**;
  initiate compliant deletion; no manual edits to personal data.
- **Subscriptions:** **read + reconcile only**; refunds/changes in Stripe; never manual
  billing.
- **Compliance:** versioned consents; SLA-tracked, verifiable cross-system deletion;
  append-only, admin-inclusive, immutable audit log.

**Admins must never:** access PII unlogged, bulk-export without gating, hard-delete without
audit, manually charge/credit outside Stripe, or alter/delete audit logs.

---

## 12. Subscription Architecture

> Stripe is the sole source of truth; SkinIntel holds a thin, derived, server-enforced
> entitlement mirror. Honest, boring, trustworthy billing.

- **Stripe handles:** Checkout (hosted), Customer Portal (upgrade/downgrade/payment-method/
  cancel/invoices), lifecycle, proration, dunning, **Stripe Tax (EU VAT)**. One product
  ("SkinIntel Pro") with two prices (monthly, yearly); VIP = future price.
- **SkinIntel stores (mirror only):** customer/subscription ids, plan, status,
  current_period_end, interval, cancel_at_period_end, and one **derived effective
  entitlement** per user. Never card data; never authoritative over Stripe.
- **Webhooks (sync spine, signed + idempotent):** `checkout.session.completed`,
  `customer.subscription.created/updated/deleted`, `invoice.paid`/`payment_succeeded`,
  `invoice.payment_failed`, (later) `trial_will_end`. Provision access **only on confirmed
  payment**, never on checkout-start or success redirect. Log events in
  `subscription_events`.
- **Entitlements:** data-driven (`plans`/`plan_entitlements`), enforced **server-side**;
  locked data never reaches the client.
- **Usage limits:** real per-user/per-period **counters** (atomic check-and-increment),
  not `COUNT(*)`. Communicate remaining quota before the wall.
- **Failed payments:** `past_due` + grace period + Stripe dunning; downgrade only after
  retries exhausted.
- **Cancellation:** one-click in Customer Portal; **access until period end**; graceful
  downgrade; **data retained** (never delete paid history on downgrade).

---

## 13. Free / Pro Model

**Free (genuine taste, margin-safe):**
- **1 AI analysis per month** (resets — the monthly reset is the upsell engine; **not** 1
  total).
- Limited history (recent only), limited product tracking.
- Manual INCI entry, basic catalog search.
- No OCR, no before/after.

**Pro — €6.99/month or €39.99/year (~52% annual discount; lead with annual, honestly):**
- More analyses via a **generous fair-use cap** (marketed as unlimited; never an uncapped
  AI endpoint behind a flat fee).
- Full timeline history, before/after slider, **product OCR**, routine tracking,
  product-to-skin correlation insights.

**Trial:** launch **without** a separate trial — the Free tier *is* the trial. Revisit a
card-required Pro trial later as a conversion experiment.

**VIP:** later phase only, not MVP; pricing not designed around it now.

---

## 14. Premium UX Direction

> SkinIntel must feel like calm, premium self-care — a private ritual — never a clinic or a
> quantified-self dashboard.

- **Core emotion:** "I'm taking care of myself, and I can see it's working." Safety,
  reassurance, quiet competence, self-respect.
- **Visual language:** editorial, airy, tactile, soft depth, slow organic motion; the
  user's own images are the hero; one focal point per screen.
- **Color:** warm off-whites/creams + **one** muted earthy/rosy accent + soft warm greys.
  **Avoid clinical blue/teal, alarm red, neon, heavy gradients, stark clinical contrast.**
  "Needs attention" = soft amber at most, **never red on skin observations**.
- **Typography:** refined editorial (serif headline + humanist sans body works well),
  large sizes, generous spacing; warm, plain-language, non-medical voice.
- **States:** onboarding = gentle welcome ritual (privacy reassurance front-loaded);
  loading (analysis) = calm anticipation, breathing animation; empty states = inviting
  beginnings, never barren or guilt-inducing.
- **Premium moments (designed peaks):** before/after reveal, monthly recap, analysis
  result reveal — treated as personal gifts.
- **Inspiration:** Headspace/Calm, Apple Health/Fitness, Notion, Oura, premium skincare
  brands (Aesop). Backbone: Apple HIG clarity + Headspace warmth.
- **Trust-destroyers to avoid:** clinical aesthetics, red alerts on skin, scores-as-grades,
  gamified gimmicks, fear-mongering, aggressive upsell walls.

---

## 15. Mobile-First Strategy

- **Mobile is the primary experience** (skin photos are taken on phones); desktop is a
  spacious companion.
- Thumb-first, bottom tab bar (the 5 destinations), large tap targets, one-handed reach.
- **Camera capture is a first-class, guided, private, frictionless flow.**
- **Delivered as an installable PWA:** app-like (no browser chrome), fast and
  offline-tolerant for viewing cached timeline/results, home-screen presence, opt-in gentle
  push for the weekly ritual nudge and monthly recap (never spammy).
- Desktop: more spacious editorial layouts, same calm language, never denser for its own
  sake.

---

## 16. MVP Scope

- Auth + profiles + **RLS** on user-owned tables; Skin Profile basics.
- **AI Analysis core:** image upload → EXIF strip → WebP → private storage; analyses +
  images + observation categories; neutral cosmetic output + cost tracking.
- **History & Timeline:** store/display analyses over time (weekly/monthly); latest
  analysis + overview on dashboard.
- **Products & INCI (manual-first):** product library, ingredients + product_ingredients,
  verified/unverified model + admin verification queue; alias model foundational.
- **Routine Tracker:** AM/PM, frequency, one-tap logging, link to timeline periods.
- **Monetization (Stripe):** Free/Pro, Checkout + webhooks + Customer Portal, server-side
  entitlement enforcement, usage counters.
- **Pro visual features:** before/after slider, product OCR.
- **Admin (lean):** verification, users, compliance (consent/audit/deletion), subscriptions
  (read), basic cost/usage monitoring.
- **Product-level** correlation (simple, observational).
- **Mobile-first PWA** delivery; premium calm UX.

---

## 17. Post-MVP Scope

- **VIP tier** (definition deferred).
- **Ingredient-level correlation** (needs data volume + mature canonical vocabulary).
- **Internet product search** with `source_url` auto-population + admin verification.
- **Front-of-product image recognition** (visual product ID without a label).
- **Proactive image moderation**, deeper analysis-review tooling, platform-health module.
- **Multi-admin roles/permissions.**
- Optional **card-required Pro trial** as a conversion experiment.
- Possible deeper server-side email/validation hardening.

---

## 18. What Is Explicitly Out Of Scope

- Any **medical** functionality: diagnoses, "doctor", treatment/cure claims, medical
  condition labels (acne, dermatitis, eczema, rosacea as labels).
- **Marketplace** of any kind / recommendations-to-buy.
- **Community / social features** / reviews.
- **Chat / messaging.**
- **Dark patterns**, hidden/confusing cancellation, manual billing outside Stripe.
- Native mobile apps (web/PWA first).
- Multi-language (defer until validated), team/multi-user accounts.
- Public direct image URLs; ingredient health/toxicity/"dangerous" framing.

---

## 19. Final Product Roadmap

Sequenced for a solo founder. Each phase is shippable and validated before the next.

- **Phase A — Foundation & Auth:** auth, profiles, RLS, Skin Profile basics.
- **Phase B — AI Analysis Core:** image pipeline (EXIF→WebP→private store), analyses +
  observations, neutral output + cost tracking. *(Gated by the locked image-storage
  decision — backbone of everything.)*
- **Phase C — History & Timeline:** analyses over time, dashboard overview/latest.
- **Phase D — Products & INCI:** library (manual-first), ingredients + aliases,
  verified/unverified + admin verification queue.
- **Phase E — Routine Tracker:** routines, one-tap logging, timeline linkage.
- **Phase F — Monetization (Stripe):** Free/Pro, Checkout + webhooks + Portal, server-side
  entitlements + usage counters.
- **Phase G — Pro Visual Features:** before/after slider, product OCR.
- **Phase H — Admin Hardening & Monitoring:** full admin, consent/audit/deletion,
  usage/cost monitoring.
- **Phase I — Future (post-MVP):** VIP, ingredient-level correlation, internet product
  search, expansions.

**Immediate next step:** lock the **image storage architecture** (provider + private URL
mechanism + original retention) so the upload → EXIF-strip → WebP → private-store pipeline
can be built without rework.

---

## 20. Critical Decisions Locked

The decisions that define the product and are expensive/irreversible to change:

1. **Trend-first product** — the timeline (cause→effect over time) is the moat, not the
   single scan.
2. **Not medical; cosmetic/educational language only** — across AI output, INCI, and UX.
3. **Image pipeline:** provider-agnostic opaque keys, private-by-default (proxy/short
   signed URLs), EXIF-stripped, WebP, per-user-prefixed; verifiable cross-system deletion.
4. **Supabase stores metadata only**; binaries on VPS/object storage.
5. **Canonical ingredient vocabulary + aliases is foundational**; AI transcribes labels,
   never invents; human-verified trust tiers (verified/unverified/provisional).
6. **Single, server-side, derived effective entitlement** per user; locked data never
   reaches the client.
7. **Stripe is the sole billing source of truth**; SkinIntel = read/reconcile mirror;
   idempotent signed webhooks; provision only on confirmed payment.
8. **Free = 1 analysis/month (resets); Pro = fair-use capped** (€6.99/mo, €39.99/yr);
   honest one-click cancellation, access until period end, data retained.
9. **Real per-user/per-period usage counters** for limit enforcement (not `COUNT(*)`).
10. **Lean admin:** least-privilege, immutable admin-inclusive audit, gated PII/skin-photo
    access; three high-leverage workflows (verification, cost-vs-revenue, compliant
    deletion).
11. **Calm premium wellness UX:** warm neutrals + one accent, no clinical/alarm cues,
    reassurance as the core emotion, designed peak moments.
12. **Mobile-first PWA**, camera-first capture, gentle opt-in ritual nudges.
13. **Scope discipline:** no marketplace, community, chat, medical features, or dark
    patterns; built for one founder.

---

*No application code, API routes, UI, or database changes are made as part of this
document. This is consolidation and formalization of already-locked decisions only.*
