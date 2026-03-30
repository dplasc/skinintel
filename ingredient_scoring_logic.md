# Ingredient Scoring Logic

## Purpose
Define how SkinIntel scores and ranks product recommendations based on ingredient similarity and user history.

## Core idea
Products are evaluated based on how similar their ingredient profiles are to products the user has already used.

## Scoring dimensions

### 1. Exact ingredient overlap
- Count how many ingredients match exactly
- Higher overlap = worse score

### 2. Functional overlap
- Compare ingredient categories/functions
- Similar functional groups reduce score

### 3. Concern overlap
- Compare concern_flags across ingredients
- Repeated concerns reduce score

### 4. Diversity bonus
- Products with different composition get a better score

## Scoring goal
- Minimize repeated exposure to similar ingredient patterns
- Encourage safer experimentation

## Output concept
Each product can be assigned a relative score such as:
- low similarity (best)
- medium similarity
- high similarity (avoid)

## Rules
- this is a draft only
- no code yet
- no formulas yet
- no database logic yet
