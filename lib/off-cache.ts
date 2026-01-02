/**
 * lib/off-cache.ts
 *
 * In-memory TTL cache for OpenFoodFacts product lookups.
 * Provides LRU eviction when maxEntries is exceeded and automatic expiry based on TTL.
 * This cache is used by off-client.ts to avoid repeated network requests for the same barcode.
 *
 * Design:
 * - Stores normalized product data keyed by barcode
 * - Each entry has an expiration timestamp
 * - When cache size exceeds maxEntries, the least-recently-used entry is evicted
 * - Expired entries are automatically removed on access
 *
 * Dependencies: None (pure in-memory, no persistence)
 * Integration: Used by lib/off-client.ts and lib/client-analyzer.ts
 */

/**
 * Normalized product data structure from OpenFoodFacts.
 * Represents the essential fields used for analysis.
 */
export interface NormalizedOffProduct {
  /** Product barcode (e.g., EAN-13, UPC-A) */
  barcode: string;
  /** Product name */
  productName?: string;
  /** Brand(s) */
  brands?: string;
  /** Ingredients text (raw or normalized) */
  ingredientsText?: string;
  /** Nutriment data (e.g., energy, fat, sugars, etc.) */
  nutriments?: Record<string, number | string>;
  /** Nutri-Score grade (A-E) if available */
  nutriscoreGrade?: string;
  /** NOVA group (1-4) if available */
  novaGroup?: number;
  /** Ecoscore grade (a-e) if available */
  ecoscoreGrade?: string;
  /** Image URLs */
  imageUrl?: string;
  /** Allergens */
  allergens?: string;
  /** Labels (e.g., organic, fair-trade) */
  labels?: string;
  /** Categories */
  categories?: string;
}

/**
 * Cache entry with expiration metadata.
 * Internal structure storing product data and expiry timestamp.
 */
interface CacheEntry {
  /** The cached product data */
  value: NormalizedOffProduct;
  /** Expiration timestamp (milliseconds since epoch) */
  expiresAt: number;
  /** Last access timestamp for LRU tracking */
  lastAccessed: number;
}

/**
 * Configuration options for the cache.
 */
interface CacheConfig {
  /** Maximum number of entries before eviction (default: 500) */
  maxEntries?: number;
  /** Default TTL in milliseconds (default: 24 hours) */
  defaultTTL?: number;
}

/**
 * In-memory LRU cache with TTL for OpenFoodFacts products.
 * Thread-safe for single-threaded environments (browser/Node.js event loop).
 */
export class OffCache {
  private cache: Map<string, CacheEntry>;
  private readonly maxEntries: number;
  private readonly defaultTTL: number;

  /**
   * Create a new OFF cache instance.
   * @param config - Cache configuration (maxEntries, defaultTTL)
   */
  constructor(config: CacheConfig = {}) {
    this.cache = new Map();
    this.maxEntries = config.maxEntries ?? 500;
    this.defaultTTL = config.defaultTTL ?? 24 * 60 * 60 * 1000; // 24 hours
  }

  /**
   * Get a cached product by barcode.
   * Returns null if not found or expired.
   * Updates last access time for LRU tracking.
   * @param barcode - Product barcode
   * @returns Cached product or null
   */
  get(barcode: string): NormalizedOffProduct | null {
    const entry = this.cache.get(barcode);

    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(barcode);
      return null;
    }

    // Update last accessed for LRU
    entry.lastAccessed = Date.now();
    return entry.value;
  }

  /**
   * Store a product in the cache.
   * If cache size exceeds maxEntries, evicts the least-recently-used entry.
   * @param barcode - Product barcode
   * @param product - Normalized product data
   * @param ttlMs - Optional TTL override (defaults to defaultTTL)
   */
  set(
    barcode: string,
    product: NormalizedOffProduct,
    ttlMs?: number
  ): void {
    const now = Date.now();
    const ttl = ttlMs ?? this.defaultTTL;

    // Create new entry
    const entry: CacheEntry = {
      value: product,
      expiresAt: now + ttl,
      lastAccessed: now,
    };

    // Evict LRU if at capacity and not replacing existing
    if (!this.cache.has(barcode) && this.cache.size >= this.maxEntries) {
      this.evictLRU();
    }

    this.cache.set(barcode, entry);
  }

  /**
   * Check if a barcode exists in the cache (and is not expired).
   * @param barcode - Product barcode
   * @returns true if cached and valid, false otherwise
   */
  has(barcode: string): boolean {
    return this.get(barcode) !== null;
  }

  /**
   * Delete a specific entry from the cache.
   * @param barcode - Product barcode
   * @returns true if deleted, false if not found
   */
  delete(barcode: string): boolean {
    return this.cache.delete(barcode);
  }

  /**
   * Clear all entries from the cache.
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get the current number of entries in the cache.
   * Note: may include expired entries that haven't been accessed/cleaned yet.
   * @returns Number of entries
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Evict the least-recently-used entry from the cache.
   * Finds the entry with the oldest lastAccessed timestamp and removes it.
   * @private
   */
  private evictLRU(): void {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  /**
   * Clean up expired entries from the cache.
   * Can be called periodically or manually to free memory.
   * Returns the number of entries removed.
   * @returns Number of expired entries removed
   */
  cleanup(): number {
    const now = Date.now();
    let removed = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        removed++;
      }
    }

    return removed;
  }
}

/**
 * Global singleton cache instance.
 * Used across the application for consistent caching behavior.
 */
export const offCache = new OffCache();
