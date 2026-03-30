# Product Database Population Plan

## 1. Goal
- Add a reliable set of skincare products so SkinIntel can return relevant, consistent product recommendations based on verified product data.

## 2. Data Source Rules
- Product data comes from official brand pages, official retailer pages, or product packaging details.
- INCI must be from packaging labels or an official source.
- No guessing ingredients when INCI is missing.

## 3. Product Structure (must match DB)
- name
- brand
- category
- skin_use_case
- why_relevant
- inci_available
- inci_source_url
- product_source_url
- source_type

## 4. Batch Strategy
- Insert products in small batches (5–10).
- Verify each batch before next.

## 5. Verification Rules
- No duplicates.
- All required fields filled.
- INCI verified.
- Links working.

## 6. First Dataset Scope
- We start with TOP 20 verified products (already created).

## 7. Future Expansion
- Expand gradually after validation.
