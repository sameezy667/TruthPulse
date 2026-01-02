/**
 * lib/off-client.ts
 *
 * Client for OpenFoodFacts API product lookups.
 * Fetches product nutritional data from the public OFF API by barcode,
 * normalizes the response, and integrates with the in-memory cache.
 *
 * Flow:
 * 1. Check offCache for cached product
 * 2. If cache miss, fetch from OFF API
 * 3. Parse and normalize response
 * 4. Cache valid responses
 * 5. Return normalized product or null
 *
 * Error handling:
 * - Network errors: log and return null (fallback to OCR)
 * - Rate limits (429): log warning and return null
 * - Malformed responses: log and return null
 * - Product not found (status=0): return null
 *
 * Dependencies:
 * - lib/off-cache.ts (caching layer)
 * - global fetch API (browser/Node.js)
 *
 * Integration:
 * - Called by lib/client-analyzer.ts when barcode is detected
 * - Results passed to Gemini analysis pipeline
 */

import { offCache, NormalizedOffProduct } from './off-cache';

/**
 * OpenFoodFacts API base URL.
 * World endpoint supports all countries/languages.
 */
const OFF_API_BASE = 'https://world.openfoodfacts.org/api/v0';

/**
 * Default fetch timeout in milliseconds.
 * Mobile networks can be slow; 8s allows for reasonable retries.
 */
const FETCH_TIMEOUT_MS = 8000;

/**
 * User-Agent header for API requests.
 * OFF API encourages identifying your app for analytics and support.
 */
const USER_AGENT = 'Sach.ai/1.0 (Product Analysis App)';

/**
 * OpenFoodFacts API response structure.
 * Actual response contains many more fields; we extract only what we need.
 */
interface OffApiResponse {
  /** Status code: 1 = found, 0 = not found */
  status: number;
  /** Status text (verbose or empty) */
  status_verbose?: string;
  /** Product data (present if status=1) */
  product?: {
    /** Product barcode */
    code?: string;
    /** Product name */
    product_name?: string;
    /** Brands (comma-separated) */
    brands?: string;
    /** Ingredients text */
    ingredients_text?: string;
    /** Nutriments object */
    nutriments?: Record<string, number | string>;
    /** Nutri-Score grade (a-e) */
    nutriscore_grade?: string;
    /** NOVA group (1-4) */
    nova_group?: number;
    /** Ecoscore grade (a-e) */
    ecoscore_grade?: string;
    /** Image front URL */
    image_url?: string;
    image_front_url?: string;
    /** Allergens */
    allergens?: string;
    allergens_tags?: string[];
    /** Labels */
    labels?: string;
    labels_tags?: string[];
    /** Categories */
    categories?: string;
    categories_tags?: string[];
  };
  /** Error code (if any) */
  code?: string;
}

/**
 * Fetch product data from OpenFoodFacts API by barcode.
 * Returns cached data if available, otherwise performs network request.
 * On success, caches the result for future lookups.
 *
 * @param barcode - Product barcode (EAN-13, UPC-A, etc.)
 * @returns Normalized product data or null if not found/error
 */
export async function fetchOffProduct(
  barcode: string
): Promise<NormalizedOffProduct | null> {
  // Validate barcode format (basic check)
  if (!barcode || !/^\d+$/.test(barcode)) {
    console.warn(`[OFF] Invalid barcode format: ${barcode}`);
    return null;
  }

  // Check cache first
  const cached = offCache.get(barcode);
  if (cached) {
    console.log(`[OFF] Cache hit for barcode: ${barcode}`);
    return cached;
  }

  console.log(`[OFF] Cache miss, fetching from API: ${barcode}`);

  try {
    // Construct API endpoint
    const url = `${OFF_API_BASE}/product/${barcode}.json`;

    // Fetch with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'User-Agent': USER_AGENT,
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Handle HTTP errors
    if (!response.ok) {
      if (response.status === 429) {
        console.warn('[OFF] Rate limit exceeded (429), backing off');
        return null;
      }
      if (response.status === 404) {
        console.log(`[OFF] Product not found (404): ${barcode}`);
        return null;
      }
      console.error(`[OFF] HTTP error ${response.status}: ${response.statusText}`);
      return null;
    }

    // Parse JSON response
    const data: OffApiResponse = await response.json();

    // Check if product was found
    if (data.status !== 1 || !data.product) {
      console.log(`[OFF] Product not found (status=${data.status}): ${barcode}`);
      return null;
    }

    // Normalize product data
    const normalized = normalizeOffProduct(barcode, data.product);

    // Cache the result
    offCache.set(barcode, normalized);

    console.log(`[OFF] Successfully fetched and cached: ${barcode}`);
    return normalized;
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        console.error(`[OFF] Request timeout for barcode: ${barcode}`);
      } else {
        console.error(`[OFF] Fetch error for barcode ${barcode}:`, error.message);
      }
    }
    return null;
  }
}

/**
 * Normalize OpenFoodFacts product data into our internal format.
 * Extracts and standardizes the fields we need for analysis.
 *
 * @param barcode - Product barcode
 * @param product - Raw OFF product object
 * @returns Normalized product data
 */
function normalizeOffProduct(
  barcode: string,
  product: OffApiResponse['product']
): NormalizedOffProduct {
  if (!product) {
    return { barcode };
  }

  return {
    barcode,
    productName: product.product_name || undefined,
    brands: product.brands || undefined,
    ingredientsText: product.ingredients_text || undefined,
    nutriments: product.nutriments || undefined,
    nutriscoreGrade: product.nutriscore_grade?.toLowerCase() || undefined,
    novaGroup: product.nova_group || undefined,
    ecoscoreGrade: product.ecoscore_grade?.toLowerCase() || undefined,
    imageUrl: product.image_front_url || product.image_url || undefined,
    allergens:
      product.allergens ||
      product.allergens_tags?.join(', ') ||
      undefined,
    labels:
      product.labels ||
      product.labels_tags?.join(', ') ||
      undefined,
    categories:
      product.categories ||
      product.categories_tags?.join(', ') ||
      undefined,
  };
}

/**
 * Clear the OFF cache.
 * Useful for testing or when user wants to refresh data.
 */
export function clearOffCache(): void {
  offCache.clear();
  console.log('[OFF] Cache cleared');
}

/**
 * Get cache statistics.
 * Returns current size and performs cleanup of expired entries.
 * @returns Object with cache size and cleanup stats
 */
export function getOffCacheStats(): {
  size: number;
  expired: number;
} {
  const expired = offCache.cleanup();
  return {
    size: offCache.size(),
    expired,
  };
}
