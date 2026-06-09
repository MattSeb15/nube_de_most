/**
 * Simple in-memory cache for SPA data fetching.
 * Uses a global Map to store data by key with a timestamp.
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const memoryCache = new Map<string, CacheEntry<any>>();

// Default TTL is 5 minutes
const DEFAULT_TTL = 5 * 60 * 1000;

export const CacheUtils = {
  /**
   * Gets data from cache if it exists and hasn't expired.
   */
  get<T>(key: string, ttl: number = DEFAULT_TTL): T | null {
    const entry = memoryCache.get(key);
    if (!entry) return null;

    const isExpired = Date.now() - entry.timestamp > ttl;
    if (isExpired) {
      memoryCache.delete(key);
      return null;
    }

    return entry.data as T;
  },

  /**
   * Sets data in the cache.
   */
  set<T>(key: string, data: T): void {
    memoryCache.set(key, {
      data,
      timestamp: Date.now(),
    });
  },

  /**
   * Clears a specific key or the entire cache.
   */
  clear(key?: string): void {
    if (key) {
      memoryCache.delete(key);
    } else {
      memoryCache.clear();
    }
  }
};
