# Ingredient Schema Draft

## Purpose
Define the minimum data structure for one INCI ingredient before database implementation.

## Required fields
- inci_name
- normalized_name
- category

## Optional fields
- common_name
- aliases
- function
- description
- concern_flags
- compatibility_notes
- source
- status

## Ingredient-level goal
Each ingredient must support future comparison, similarity filtering, concern detection, and recommendation logic across multiple products.

## Rules
- this is a draft only
- no SQL yet
- no app code yet
- no admin UI yet
