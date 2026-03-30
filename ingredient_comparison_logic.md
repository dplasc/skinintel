# Ingredient Comparison Logic

## Purpose
Define how SkinIntel compares ingredients across products to detect similarity and avoid repeating problematic patterns.

## Comparison levels

### 1. Exact match
- Same normalized_name
- Highest similarity

### 2. Alias match
- Ingredient appears in aliases list
- Treated as same ingredient

### 3. Functional similarity
- Same category or function
- Example: multiple exfoliating acids

### 4. Concern pattern match
- Ingredients sharing same concern_flags
- Example: irritation, comedogenic risk

## Elimination goal
- Reduce repetition of similar ingredient patterns across user-used products
- Help identify potential triggers based on repeated exposure

## Recommendation principle
- Prefer products with lower overlap in:
  - exact ingredients
  - functional groups
  - concern flags

## Rules
- this is a draft only
- no code yet
- no scoring yet
- no database logic yet
