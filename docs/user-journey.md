# SkinIntel — User Journey

## 1. First Visit

- User lands on homepage (/)
- User understands value proposition (skin analysis)
- User proceeds to dashboard

## 2. Pre-Scan Step

- User is presented with required legal checkboxes:
  - educational (non-medical)
  - consent for image/data processing

## 3. Scan Input

- User provides:
  - images (1–5)
  - description
  - symptoms
  - products used

## 4. AI Analysis

- System sends input to AI
- AI returns structured JSON result
- No medical diagnosis is given

## 5. Results Experience

- User sees:
  - explanation (intro)
  - assessment
  - top recommendations
  - next steps

## 6. Product Matching

- System compares user ingredients with product database
- Shows scored products

## 7. Save Result (Local)

- Result is saved to localStorage
- Only last result is stored

## 8. Return Visit

- User comes back later
- System detects saved result
- User can load last analysis

## 9. Retention Loop

- User repeats scan over time
- Tracks changes manually (for now)
