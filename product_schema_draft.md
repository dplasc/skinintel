# Product Schema (Draft)


## Purpose

Define strict rules for adding products into SkinIntel database.


## INCI Rules (CRITICAL)

- must be copied from official packaging or brand website
- must be raw (no translation)
- must be comma-separated
- must preserve original ingredient order
- no added comments inside INCI
- no missing ingredients
- no reformatting


## Required Fields

Each product MUST have:

- name (string)
- brand (string)
- category (string)
- inci_raw (string)
- notes (array of short bullet points)


## Category Rules

Allowed categories (for now):

- cleanser
- serum
- moisturizer
- sunscreen
- acne treatment
- toner
- mask
- other (fallback)


## Notes Rules

- short bullet points
- no marketing claims
- no medical claims
- factual only


## Validation

A product is VALID only if:

- INCI follows all rules
- all required fields exist
- no assumptions are made
# Product Schema Draft

## Purpose
Define the minimum data structure for skincare products in SkinIntel before database implementation.

## Product fields
- brand
- product_name
- full_name
- category
- inci_raw
- inci_parsed
- notes
- source
- status

## Ingredient-level goal
Each product must support future ingredient analysis, similarity detection, and elimination logic based on INCI composition.

## Rules
- this is a draft only
- no SQL yet
- no app code yet
- no admin UI yet

## User journey logic
- User starts with a questionnaire that includes age, sex, location, problem type, written description, and skin images.
- User selects products already used from the available list.
- If a product is missing, the user can enter it manually.
- If the user has used nothing before, the flow should support a "first time using products" path.

## Usage history logic
- The system should support a personal usage history for each paid user.
- The history should track which products the user has already tried.
- The history should support step-based follow-up attempts over time.
- Future recommendation logic should avoid suggesting products with highly similar ingredient profiles to products already tried when possible.

## Product comparison goal
- The core strength of SkinIntel is filtering and comparing creams by composition.
- Recommendation logic should consider whether the user may be reacting to a repeated ingredient pattern across multiple products.
- Future product guidance should help the user move toward alternatives with less similar ingredient overlap.

## INCI data rules
- INCI must be taken from product packaging or official source
- Do not use translated or marketing ingredient names
- Keep ingredient order exactly as listed (descending concentration)
- Do not modify or normalize raw INCI text
- Always store original INCI as inci_raw
