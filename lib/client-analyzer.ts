/**
 * Client-side analyzer for standalone APK and web
 * 
 * Flow:
 * 1. If barcode provided, try local database lookup (offline-first)
 * 2. If not in local DB, fetch from OpenFoodFacts API (network)
 * 3. If product found, send nutritional data to server for AI analysis
 * 4. If not found or no barcode, perform on-device OCR
 * 5. Submit extracted text to server for AI analysis
 */

import { analyzeProductLocally } from './product-analyzer';
import { getProductByBarcode } from './openfoodfacts-db';
import { extractTextWithConfidence, isOCRConfidenceAcceptable } from './ocr';
import { submitTextForAnalysis } from './client-ai';
import { UserProfile } from './types';
import { AIResponse } from './schemas';
import { fetchOffProduct } from './off-client';
import type { NormalizedOffProduct } from './off-cache';

/**
 * Analyze product using barcode lookup, OpenFoodFacts, OCR, or server AI
 * @param imageBase64 - Base64 encoded image (for OCR if needed)
 * @param profile - User dietary profile
 * @param barcode - Optional barcode from scanner
 * @returns Analysis result or instruction to retake photo
 */
export async function analyzeClientSide(
  imageBase64: string,
  profile: UserProfile,
  barcode?: string
): Promise<AIResponse> {
  // Priority 1: Barcode database lookup (instant, offline)
  if (barcode) {
    console.log('Attempting barcode lookup:', barcode);
    
    // Try local database first (offline-first)
    const localProduct = getProductByBarcode(barcode);
    if (localProduct) {
      console.log('Product found in local database:', localProduct.name);
      return analyzeProductLocally(localProduct, profile);
    }
    
    console.log('Barcode not found in local database, fetching from OpenFoodFacts...');
    
    // Try OpenFoodFacts API (network lookup with cache)
    try {
      const offProduct = await fetchOffProduct(barcode);
      if (offProduct) {
        console.log('Product found on OpenFoodFacts:', offProduct.productName || barcode);
        
        // Convert OFF product to text format for AI analysis
        const productText = formatOffProductForAnalysis(offProduct);
        
        // Submit to server for AI analysis
        console.log('Submitting OpenFoodFacts data for AI analysis...');
        const analysis = await submitTextForAnalysis(
          productText,
          profile,
          barcode,
          100 // High confidence since data comes from structured API
        );
        
        return analysis;
      }
    } catch (error) {
      console.error('OpenFoodFacts fetch failed:', error);
      // Continue to OCR fallback
    }
    
    console.log('Barcode not found on OpenFoodFacts, falling back to OCR + AI');
  }

  // Priority 2: On-device OCR + server AI analysis
  try {
    console.log('Performing on-device OCR...');
    const ocrResult = await extractTextWithConfidence(imageBase64);
    
    console.log('OCR completed:', {
      textLength: ocrResult.text.length,
      confidence: ocrResult.confidence.toFixed(1) + '%',
    });

    // Check OCR confidence threshold
    if (!isOCRConfidenceAcceptable(ocrResult.confidence)) {
      console.warn('OCR confidence below threshold:', ocrResult.confidence);
      return {
        type: 'UNCERTAIN',
        rawText: `The image quality is too low (${ocrResult.confidence.toFixed(0)}% confidence). Please retake the photo with better lighting and focus on the ingredients label.`,
      };
    }

    // Submit text for server-side AI analysis
    console.log('Submitting text for AI analysis...');
    const analysis = await submitTextForAnalysis(
      ocrResult.text,
      profile,
      barcode,
      ocrResult.confidence
    );

    return analysis;
  } catch (error: any) {
    console.error('Client-side analysis failed:', error);
    return {
      type: 'UNCERTAIN',
      rawText: `Failed to analyze product: ${error.message || 'Unknown error'}. Please try again or ensure you have an internet connection.`,
    };
  }
}

/**
 * Check if analysis should fall back to server
 * (For UI components to decide whether to show retry/offline messages)
 */
export function shouldFallbackToServer(barcode?: string): boolean {
  // If barcode provided but not in local DB, need server
  if (barcode) {
    const product = getProductByBarcode(barcode);
    return !product;
  }
  // No barcode = always need OCR + server AI
  return true;
}

/**
 * Format OpenFoodFacts product data as text for AI analysis.
 * Converts structured OFF data into a readable format similar to OCR text.
 * @param product - Normalized OFF product data
 * @returns Formatted text for AI analysis
 */
function formatOffProductForAnalysis(product: NormalizedOffProduct): string {
  const parts: string[] = [];

  if (product.productName) {
    parts.push(`Product: ${product.productName}`);
  }

  if (product.brands) {
    parts.push(`Brand: ${product.brands}`);
  }

  if (product.ingredientsText) {
    parts.push(`Ingredients: ${product.ingredientsText}`);
  }

  if (product.nutriments) {
    parts.push('Nutrition Facts (per 100g):');
    const nutriments = product.nutriments;
    
    if (nutriments['energy-kcal']) {
      parts.push(`- Energy: ${nutriments['energy-kcal']} kcal`);
    }
    if (nutriments.fat) {
      parts.push(`- Fat: ${nutriments.fat}g`);
    }
    if (nutriments['saturated-fat']) {
      parts.push(`  - Saturated Fat: ${nutriments['saturated-fat']}g`);
    }
    if (nutriments.carbohydrates) {
      parts.push(`- Carbohydrates: ${nutriments.carbohydrates}g`);
    }
    if (nutriments.sugars) {
      parts.push(`  - Sugars: ${nutriments.sugars}g`);
    }
    if (nutriments.fiber) {
      parts.push(`- Fiber: ${nutriments.fiber}g`);
    }
    if (nutriments.proteins) {
      parts.push(`- Protein: ${nutriments.proteins}g`);
    }
    if (nutriments.salt) {
      parts.push(`- Salt: ${nutriments.salt}g`);
    }
    if (nutriments.sodium) {
      parts.push(`- Sodium: ${nutriments.sodium}g`);
    }
  }

  if (product.allergens) {
    parts.push(`Allergens: ${product.allergens}`);
  }

  if (product.labels) {
    parts.push(`Labels: ${product.labels}`);
  }

  if (product.nutriscoreGrade) {
    parts.push(`Nutri-Score: ${product.nutriscoreGrade.toUpperCase()}`);
  }

  if (product.novaGroup) {
    parts.push(`NOVA Group: ${product.novaGroup}`);
  }

  if (product.ecoscoreGrade) {
    parts.push(`Eco-Score: ${product.ecoscoreGrade.toUpperCase()}`);
  }

  return parts.join('\n');
}
