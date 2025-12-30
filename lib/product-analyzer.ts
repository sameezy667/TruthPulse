import { Product } from './openfoodfacts-db';
import { UserProfile } from './types';
import type { AIResponse } from './schemas';

/**
 * Analyze a product from the local database
 * This is used as a fallback when AI fails or for faster responses
 */
export function analyzeProductLocally(
  product: Product,
  userProfile: UserProfile
): AIResponse {
  switch (userProfile) {
    case UserProfile.DIABETIC:
      return analyzeDiabetic(product);
    case UserProfile.VEGAN:
      return analyzeVegan(product);
    case UserProfile.PALEO:
      return analyzePaleo(product);
    default:
      return {
        type: 'UNCERTAIN',
        rawText: 'Unknown profile type',
      };
  }
}

function analyzeDiabetic(product: Product): AIResponse {
  const { nutrition, ingredients, name } = product;
  const highSugarThreshold = 10; // grams per 100g
  const mediumSugarThreshold = 5;

  // Check sugar content
  if (nutrition.sugars >= highSugarThreshold) {
    const risks: Array<{ ingredient: string; severity: 'high' | 'med'; reason: string }> = [];
    
    // Find sugar-related ingredients
    const sugarIngredients = ingredients.filter(ing =>
      /sugar|syrup|honey|fructose|glucose|dextrose|maltose/i.test(ing)
    );

    sugarIngredients.forEach(ing => {
      risks.push({
        ingredient: ing,
        severity: 'high' as const,
        reason: `Contains ${nutrition.sugars}g of sugar per 100g, which can cause rapid blood sugar spikes`,
      });
    });

    // Check for high carbs
    if (nutrition.carbohydrates > 50) {
      risks.push({
        ingredient: 'High Carbohydrate Content',
        severity: 'med' as const,
        reason: `${nutrition.carbohydrates}g of carbs per 100g can significantly impact blood glucose levels`,
      });
    }

    return {
      type: 'RISK',
      headline: `High Sugar Content Detected (${nutrition.sugars}g per 100g)`,
      riskHierarchy: risks,
    };
  } else if (nutrition.sugars >= mediumSugarThreshold) {
    return {
      type: 'RISK',
      headline: `Moderate Sugar Content (${nutrition.sugars}g per 100g)`,
      riskHierarchy: [
        {
          ingredient: 'Sugar',
          severity: 'med',
          reason: `Contains ${nutrition.sugars}g of sugar per 100g. Monitor portion sizes to avoid blood sugar spikes`,
        },
      ],
    };
  } else {
    return {
      type: 'SAFE',
      summary: `${name} is diabetic-friendly with only ${nutrition.sugars}g of sugar per 100g. Low glycemic impact makes it a safe choice for blood sugar management.`,
      safeBadge: true,
    };
  }
}

function analyzeVegan(product: Product): AIResponse {
  const { ingredients, allergens, name } = product;

  // Check for animal-derived ingredients
  const animalIngredients = ingredients.filter(ing =>
    /milk|cheese|butter|cream|whey|casein|lactose|egg|honey|gelatin|meat|fish|chicken|beef|pork|bacon|lard/i.test(ing)
  );

  // Check allergens
  const animalAllergens = allergens.filter(allergen =>
    /milk|egg|fish|shellfish/i.test(allergen)
  );

  if (animalIngredients.length > 0 || animalAllergens.length > 0) {
    const risks: Array<{ ingredient: string; severity: 'high'; reason: string }> = [];

    animalIngredients.forEach(ing => {
      risks.push({
        ingredient: ing,
        severity: 'high' as const,
        reason: 'Animal-derived ingredient not suitable for vegan diet',
      });
    });

    animalAllergens.forEach(allergen => {
      if (!animalIngredients.some(ing => ing.toLowerCase().includes(allergen.toLowerCase()))) {
        risks.push({
          ingredient: allergen,
          severity: 'high' as const,
          reason: 'Contains animal-derived allergen',
        });
      }
    });

    return {
      type: 'RISK',
      headline: 'Contains Animal Products',
      riskHierarchy: risks,
    };
  }

  // Check for ambiguous ingredients
  const ambiguousIngredients = ingredients.filter(ing =>
    /natural flavor|artificial flavor|mono and diglycerides|lecithin|vitamin d/i.test(ing)
  );

  if (ambiguousIngredients.length > 0) {
    return {
      type: 'DECISION',
      question: `${name} contains "${ambiguousIngredients[0]}" which might be animal-derived. How strict is your vegan diet?`,
      options: ['Strict', 'Flexible'],
    };
  }

  return {
    type: 'SAFE',
    summary: `${name} is 100% plant-based with no animal-derived ingredients. Safe for vegan diet.`,
    safeBadge: true,
  };
}

function analyzePaleo(product: Product): AIResponse {
  const { ingredients, name } = product;

  // Check for non-paleo ingredients
  const grains = ingredients.filter(ing =>
    /wheat|flour|rice|corn|oat|barley|rye|bread|pasta|cereal/i.test(ing)
  );

  const legumes = ingredients.filter(ing =>
    /bean|lentil|peanut|soy|chickpea|pea protein/i.test(ing)
  );

  const dairy = ingredients.filter(ing =>
    /milk|cheese|butter|cream|whey|yogurt|lactose/i.test(ing)
  );

  const processed = ingredients.filter(ing =>
    /hydrogenated|msg|monosodium glutamate|high fructose corn syrup|artificial/i.test(ing)
  );

  const risks: Array<{ ingredient: string; severity: 'high' | 'med'; reason: string }> = [];

  grains.forEach(ing => {
    risks.push({
      ingredient: ing,
      severity: 'high' as const,
      reason: 'Grains are not allowed on paleo diet',
    });
  });

  legumes.forEach(ing => {
    risks.push({
      ingredient: ing,
      severity: 'high' as const,
      reason: 'Legumes are not allowed on paleo diet',
    });
  });

  dairy.forEach(ing => {
    risks.push({
      ingredient: ing,
      severity: 'med' as const,
      reason: 'Dairy is typically avoided on strict paleo diet',
    });
  });

  processed.forEach(ing => {
    risks.push({
      ingredient: ing,
      severity: 'high' as const,
      reason: 'Highly processed ingredients are not paleo-friendly',
    });
  });

  if (risks.length > 0) {
    return {
      type: 'RISK',
      headline: 'Contains Non-Paleo Ingredients',
      riskHierarchy: risks,
    };
  }

  return {
    type: 'SAFE',
    summary: `${name} is paleo-friendly with only whole, unprocessed ingredients. Perfect for your ancestral diet.`,
    safeBadge: true,
  };
}
