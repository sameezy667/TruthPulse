/**
 * Client-side analyzer for standalone APK
 * Uses only local OpenFoodFacts database
 */

import { analyzeProductLocally } from './product-analyzer';
import { getProductByBarcode } from './openfoodfacts-db';
import { UserProfile } from './types';

export async function analyzeClientSide(
  imageBase64: string,
  profile: UserProfile,
  barcode?: string
): Promise<any> {
  // If barcode provided, try database lookup
  if (barcode) {
    const product = getProductByBarcode(barcode);
    if (product) {
      return analyzeProductLocally(product, profile);
    }
  }

  // For standalone APK: return error for non-database products
  throw new Error(
    'This product is not in our database. Please scan one of the featured products or connect to a network with the dev server running.'
  );
}
