# SkinIntel Design System — V1

> **Status:** Design reference (documentation only).
> **Scope:** This document defines the target visual language for SkinIntel. It does **not** modify existing code, routes, or components. It is a north star for future UI work and a shared vocabulary for product, design, and engineering.
> **Aesthetic:** Premium wellness SaaS — calm, luxurious, personal. **Not** a clinical/medical product. **Not** a dense admin dashboard.

---

## Locked V1 Direction

**The visual source of truth for V1 is the generated mockup set in:**

- `04_assets/design/brand`
- `04_assets/design/ui`
- `04_assets/design/mobile`

**The product should follow the terracotta / peach premium wellness aesthetic from the mockups.**

Concretely, this locks the V1 direction to:

- **Warm ivory** background.
- **Terracotta / peach** primary accent (the brand action color).
- **Soft champagne** surfaces.
- **Charcoal** text.
- **Muted sage** used *only* as a secondary success / support color — never as the primary brand accent.

Where this document and the mockups ever disagree, **the mockups win**. The brand mockups also fix the type direction (Playfair Display for display/headings, Poppins for UI, Inter for long-form body); see §3.

---

## 1. Design Philosophy

SkinIntel is a **personal skin journey**, not a control panel and not a diagnosis tool. Every design decision should make the user feel cared for, in control, and quietly impressed.

**Principles**

- **Premium wellness.** The product should feel like a high-end skincare brand app, not enterprise software. Generous whitespace, soft transitions, refined typography.
- **Calm.** Reduce cognitive load. One primary idea per screen. No information overload, no aggressive alerts, no red-everywhere error states.
- **Luxury.** Quality over density. Subtle depth, restrained color, smooth motion. Luxury comes from restraint, not decoration.
- **Personal skin journey.** The narrative is the user's progress over time. Content is framed as "your skin", "your progress", "your routine" — first person, supportive tone.
- **Not medical.** Avoid clinical iconography (crosses, charts that look like vitals, harsh diagnostic language). Use confidence and guidance language, never "diagnosis", "disease", or alarmist phrasing.
- **Not an admin dashboard.** No data-table walls, no tiny stat tiles crammed edge-to-edge, no sidebar-heavy navigation as the primary experience. Lead with imagery, progress, and story.

**Tone words:** serene, trustworthy, elevated, soft, confident, personal.
**Anti-patterns:** clinical, busy, alarming, corporate, generic dashboard.

---

## 2. Color System

The palette is a warm, calming neutral canvas with a **terracotta / peach** accent. Color is used sparingly; surfaces are warm and quiet so skin imagery and progress remain the focus. **Sage is a secondary support color only** (success / positive progress), never the primary brand accent.

Values are provided as HEX (for reference/specs) and OKLCH (to align with the existing token pipeline in `app/globals.css`). Light mode is the primary experience; dark mode is a supportive variant.

### Core tokens (Light)

| Token | Role | HEX | OKLCH |
|---|---|---|---|
| **Primary** | Key actions, active states, brand moments | `#D9734E` (terracotta) | `oklch(0.66 0.13 45)` |
| **Secondary** | Soft supportive accent, highlights | `#F3C9B3` (peach) | `oklch(0.86 0.06 50)` |
| **Background** | App canvas | `#FBF6F0` (warm ivory) | `oklch(0.97 0.012 70)` |
| **Surface** | Cards, sheets, raised elements | `#FBF4EC` (soft champagne) | `oklch(0.96 0.014 75)` |
| **Border** | Hairlines, dividers, input outlines | `#ECE0D4` (warm sand) | `oklch(0.91 0.014 75)` |
| **Success** | Positive progress, improvement (muted sage) | `#7E9E7B` (muted sage) | `oklch(0.68 0.05 150)` |
| **Warning** | Gentle attention, never alarming | `#C99A4E` (muted amber) | `oklch(0.72 0.09 75)` |
| **Text Primary** | Headlines, key copy | `#2B2A28` (charcoal) | `oklch(0.27 0.006 60)` |
| **Text Secondary** | Supporting copy, labels, captions | `#6E6A63` (warm grey) | `oklch(0.52 0.008 70)` |

### Supporting tokens

| Token | Role | HEX |
|---|---|---|
| Primary Hover | Hover/pressed for primary | `#C45F3D` (deeper terracotta) |
| Primary Soft | Tinted backgrounds, chips, selected states | `#F7DECF` (soft peach) |
| Surface Elevated | Highest cards / popovers (near-white warm) | `#FFFDFA` |
| Surface Muted | Subtle inset panels, skeletons | `#F1E7DA` (deeper champagne) |
| Focus Ring | Keyboard focus, accessible outline | `#D9734E` @ 40% (terracotta) |
| Overlay | Modal/scrim backdrop | `#2B2A28` @ 40% |

### Dark mode (supportive variant)

| Token | HEX | OKLCH |
|---|---|---|
| Background | `#1B1816` | `oklch(0.22 0.006 60)` |
| Surface | `#262220` | `oklch(0.26 0.008 60)` |
| Border | `#FFFFFF` @ 10% | `oklch(1 0 0 / 10%)` |
| Primary | `#E8916C` (lifted terracotta) | `oklch(0.74 0.12 48)` |
| Success | `#94B190` (muted sage) | `oklch(0.74 0.05 150)` |
| Text Primary | `#F2EDE6` | `oklch(0.94 0.008 75)` |
| Text Secondary | `#A8A097` | `oklch(0.71 0.01 70)` |

### Usage rules

- **One primary accent per view.** Terracotta is for the single most important action. Never paint multiple competing CTAs in primary.
- **Terracotta leads, sage supports.** Terracotta / peach is the brand accent; muted sage appears only for success / positive-progress signals. Sage must never be used as a primary CTA or brand surface.
- **Color is a guest, not the host.** Warm ivory background and champagne surfaces dominate; accents punctuate.
- **Status colors are gentle.** Success (sage) and Warning are desaturated. Avoid pure/clinical red; if an error must appear, use a muted, low-saturation tone and supportive copy.
- **Contrast.** Body text on background/surface must meet WCAG AA (≥ 4.5:1). Text Primary on Background and Surface passes; verify any tinted backgrounds before use.

---

## 3. Typography

Typography should feel editorial and warm. A refined humanist sans for the interface; an optional serif may be used for hero/emotional moments only.

**Font families**

- **Display / Headings:** A warm geometric–humanist sans (e.g. the existing `--font-sans`). Optional elegant serif for hero headlines only.
- **Body / UI:** Same humanist sans for consistency and legibility.
- **Numerals (progress, confidence):** Tabular figures where numbers align in columns.

### Type scale

| Style | Usage | Size (desktop) | Weight | Line height | Tracking |
|---|---|---|---|---|---|
| Display | Hero / onboarding moments | 40–56px | 600 | 1.1 | -0.02em |
| **H1** | Page title | 32px | 600 | 1.2 | -0.01em |
| **H2** | Section title | 24px | 600 | 1.3 | -0.01em |
| **H3** | Card / group title | 20px | 600 | 1.35 | normal |
| **Body L** | Primary reading copy | 17px | 400 | 1.6 | normal |
| **Body** | Default UI text | 15px | 400 | 1.6 | normal |
| **Label** | Field labels, metadata | 13px | 500 | 1.4 | 0.01em |
| **Caption** | Timestamps, hints | 12px | 400 | 1.4 | 0.01em |
| **Button** | CTA text | 15px | 600 | 1 | 0.01em |

**Mobile:** reduce Display/H1/H2 by one step (use the existing fluid `clamp()` approach). Body never drops below 15px.

**Rules**

- **Headings:** weight 600 (not 700+). Luxury reads as confident, not loud. Tight but breathable line height.
- **Body:** generous line height (1.6) for calm reading. Max line length ~70 characters.
- **Labels:** subtle, slightly tracked, in Text Secondary. Sentence case, never ALL CAPS shouting (small caps acceptable for tiny meta).
- **Buttons:** weight 600, sentence case, never truncated.
- **General:** sentence case across the product. Avoid more than two weights on a single screen.

---

## 4. Layout Rules

Whitespace is a feature. Layouts breathe, content is centered on the journey, and density stays low.

### Desktop layout

- **Centered content column**, max width **1120px** for primary content; full-bleed only for hero imagery.
- Primary navigation is **light and minimal** (top bar or slim rail) — navigation is not the hero.
- **8pt spacing grid.** Spacing steps: 4, 8, 12, 16, 24, 32, 48, 64.
- Section vertical rhythm: **48–64px** between major sections.
- Avoid multi-column data walls. Prefer a lead content area with a calm secondary column.

### Mobile layout

- **Single column, full-width cards** with **16px** outer gutters.
- Sticky, minimal top bar; primary action reachable in the bottom third of the screen.
- Vertical rhythm: **24–32px** between sections.
- Content stacks in narrative order: hero/status → progress → timeline → actions.

### Card spacing

- Card inner padding: **24px** desktop, **20px** mobile.
- Gap between cards: **16px** (mobile) / **24px** (desktop).
- Content inside a card uses the 8pt grid; group related items with 8–12px, separate groups with 16–24px.

### Border radius

| Element | Radius |
|---|---|
| Buttons, inputs, chips | 12px |
| Cards, panels | 16px |
| Sheets, modals, large surfaces | 20–24px |
| Images / media within cards | 12–16px |
| Pills / avatars | full (9999px) |

Soft, generous radii reinforce the wellness feel. Avoid sharp corners.

### Shadows

Shadows are **soft, diffuse, low-contrast** — depth by light, never heavy drop shadows.

| Level | Usage | Spec |
|---|---|---|
| **Shadow 0** | Flat surfaces, inputs at rest | none / 1px hairline border |
| **Shadow 1** | Resting cards | `0 1px 2px rgba(43,42,40,0.04), 0 2px 8px rgba(43,42,40,0.05)` |
| **Shadow 2** | Hover / raised cards | `0 4px 16px rgba(43,42,40,0.08)` |
| **Shadow 3** | Modals, popovers, sheets | `0 12px 40px rgba(43,42,40,0.12)` |

Prefer **hairline borders + Shadow 1** for most cards. Reserve deeper shadows for true overlays.

---

## 5. Component Rules

Components should feel tactile and calm. Consistent radii, soft shadows, gentle motion (150–250ms ease-out).

### Buttons

- **Primary:** filled Primary, white text, radius 12px, height 48px (desktop) / 52px (mobile touch target). Hover → Primary Hover; pressed → subtle scale (0.98) and darken.
- **Secondary:** surface background, 1px Border, Text Primary. For non-destructive secondary actions.
- **Ghost/Text:** no background, Primary text, for tertiary actions.
- **Destructive:** muted, never bright red; require confirmation for irreversible actions.
- One primary button per view. Full-width primary buttons on mobile.
- Min text contrast AA; disabled state at ~40% opacity with no shadow.

### Inputs

- Height 48px, radius 12px, 1px Border, Surface background, comfortable 12–16px padding.
- Label above field (Label style), helper/caption below in Text Secondary.
- **Focus:** Primary border + soft focus ring (Primary @ 40%), no harsh glow.
- **Error:** muted warning tone + supportive helper text; never a full red field.
- Generous spacing between fields (16–24px). Avoid cramped forms.

### Upload areas

- Large, inviting **dashed-border drop zone**, radius 16px, Surface Muted background, centered icon + friendly prompt ("Add today's photo").
- Big tap target on mobile (min 120px tall).
- States: idle → hover/drag (Primary Soft fill, Primary dashed border) → uploading (calm progress) → success (soft check, thumbnail preview).
- Always show a reassuring privacy note ("Your photos are private"). Never alarming.

### Analysis cards

- Hero of the experience. Lead with the **photo/result**, large radius (16px), Shadow 1.
- Show a **confidence indicator** prominently (see §6). Use supportive language, not clinical scores.
- Layout: image → headline finding → 1–2 supporting metrics → single clear next action.
- Avoid dumping raw model output; summarize into human, encouraging insights.

### Timeline cards

- Represent a single point in the journey (a date / check-in).
- Compact horizontal layout: thumbnail + date + short summary + trend indicator (up/steady/down with gentle color).
- Tappable to expand into the full analysis. Clear chronological order, newest first by default.
- Connect cards with a subtle vertical line/dot motif to convey "journey", not a data grid.

### Progress cards

- Visualize change over time with **soft, rounded charts** (area/line with gentle gradients), not clinical bar charts.
- Always frame positively where possible ("improving", "steady"). Use Success/Warning tones gently.
- Include a short plain-language takeaway under any chart.
- Tabular numerals for any displayed values.

---

## 6. Dashboard Principles

The "dashboard" is a **personal journey home**, not an analytics console.

- **Timeline first.** The user's chronological journey is the primary structure of the home experience. Lead with "where you are now" and the path that got there.
- **Progress first.** Surface improvement and trend before raw data. The first thing a user sees should answer "how is my skin doing?".
- **Confidence visible.** Every analysis communicates confidence in an honest but reassuring way (e.g. a soft confidence band/label such as "High confidence" with a gentle visual), never a bare clinical percentage in isolation. Confidence builds trust without inducing anxiety.
- **Before/After visible.** Make transformation tangible. Offer easy, beautiful before/after comparison (paired thumbnails or a slider) as a recurring, prominent element — this is the emotional payoff of the journey.

**Hierarchy for the home view:** Current status / confidence → Progress trend → Timeline → Next action.
Avoid stat-tile grids, multi-widget overload, and dense tables.

---

## 7. Mobile Principles

Mobile is the primary, intimate context — likely used in the bathroom mirror, daily, with one hand.

- **One-hand usage.** Place primary actions within the bottom third (thumb zone). Use a bottom-anchored primary CTA / bottom sheet pattern rather than top-corner actions.
- **Large touch targets.** Minimum **48×48px** (prefer 52px) for all interactive elements; ample spacing to prevent mis-taps. Full-width primary buttons.
- **Wellness feeling.** Calm transitions (150–250ms ease-out), soft haptic-light interactions, generous whitespace, no clutter. Single-purpose screens that feel like turning a page in a personal journal.
- **Imagery-led.** Photos and progress are the heroes; chrome stays minimal. Light, warm canvas throughout.
- **Reachability & comfort.** Sticky minimal header for context, scrollable calm content, bottom sheet for secondary detail so the user never reaches the far top of the screen for core tasks.

---

## Appendix — Token mapping note

This document is intentionally decoupled from the current implementation. The existing `app/globals.css` ships a generic admin theme (purple/blue primary, neutral greys). Adopting V1 would mean **re-mapping the existing OKLCH design tokens** (`--primary`, `--background`, `--card`, `--border`, etc.) to the terracotta / peach values above — a token-level change, not a structural rewrite — preserving the current variable contract so components continue to consume `hsl(var(--token))` without modification. The target values must match the mockups referenced in the **Locked V1 Direction** section above.

**No code, routes, or components are changed by this document.**
