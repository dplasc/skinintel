export function scoreProduct(
  candidateIngredients: { name: string; category?: string; concerns?: string[] }[],
  usedProductsIngredients: { name: string; category?: string; concerns?: string[] }[][]
) {
  // candidateIngredients = ingredients of new product
  // usedProductsIngredients = list of ingredient lists from previously used products

  let exactOverlap = 0;
  let partialOverlap = 0;
  let categoryOverlap = 0;
  let concernOverlap = 0;
  const normalizedCandidates = candidateIngredients.map((ingredient) => ({
    name: ingredient.name.toLowerCase(),
    category: ingredient.category?.toLowerCase(),
    concerns: ingredient.concerns?.map((concern) => concern.toLowerCase()),
  }));
  const matchedIngredients = new Set<string>();

  for (const used of usedProductsIngredients) {
    const normalizedUsed = used.map((ingredient) => ({
      name: ingredient.name.toLowerCase(),
      category: ingredient.category?.toLowerCase(),
      concerns: ingredient.concerns?.map((concern) => concern.toLowerCase()),
    }));
    const normalizedUsedNames = normalizedUsed.map((ingredient) => ingredient.name);
    for (const ingredient of normalizedCandidates) {
      for (const usedIngredient of normalizedUsed) {
        if (
          ingredient.category &&
          usedIngredient.category &&
          ingredient.category === usedIngredient.category
        ) {
          categoryOverlap++;
          break;
        }
      }
      for (const usedIngredient of normalizedUsed) {
        if (
          ingredient.concerns &&
          usedIngredient.concerns &&
          ingredient.concerns.some((concern) => usedIngredient.concerns!.includes(concern))
        ) {
          concernOverlap++;
          break;
        }
      }

      if (matchedIngredients.has(ingredient.name)) {
        continue;
      }

      if (normalizedUsedNames.includes(ingredient.name)) {
        exactOverlap++;
        matchedIngredients.add(ingredient.name);
      } else {
        for (const usedIngredient of normalizedUsedNames) {
          if (
            ingredient.name.length >= 5 &&
            usedIngredient.length >= 5 &&
            (
              ingredient.name.includes(usedIngredient) ||
              usedIngredient.includes(ingredient.name)
            )
          ) {
            partialOverlap++;
            matchedIngredients.add(ingredient.name);
            break;
          }
        }
      }
    }
  }

  let result = "low";
  const totalOverlap =
    exactOverlap * 2 +
    partialOverlap * 1 +
    categoryOverlap * 2 +
    concernOverlap * 3;

  if (totalOverlap > 15) {
    result = "high";
  } else if (totalOverlap > 5) {
    result = "medium";
  }

  return {
    exactOverlap,
    partialOverlap,
    categoryOverlap,
    concernOverlap,
    totalOverlap,
    result,
  };
}
