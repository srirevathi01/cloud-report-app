import { SecurityIssue, SecurityStats } from '../types';

const STORAGE_KEY_PREFIX = 'security_cache_';
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

interface SecurityCacheData {
  issues: SecurityIssue[];
  stats: SecurityStats;
  timestamp: number;
  accountId: string;
  region: string;
}

export const securityCache = {
  /**
   * Generate cache key for category
   */
  getCacheKey(categoryId: string): string {
    return `${STORAGE_KEY_PREFIX}${categoryId}`;
  },

  /**
   * Save security data to localStorage
   */
  save(
    categoryId: string,
    accountId: string,
    region: string,
    issues: SecurityIssue[],
    stats: SecurityStats
  ): void {
    try {
      const data: SecurityCacheData = {
        issues,
        stats,
        timestamp: Date.now(),
        accountId,
        region,
      };

      localStorage.setItem(this.getCacheKey(categoryId), JSON.stringify(data));
      console.log(`Cached security data for ${categoryId}`);
    } catch (error) {
      console.error('Error saving security cache:', error);
    }
  },

  /**
   * Load security data from localStorage
   */
  load(categoryId: string, accountId: string, region: string): SecurityCacheData | null {
    try {
      const key = this.getCacheKey(categoryId);
      const cached = localStorage.getItem(key);

      if (!cached) return null;

      const data: SecurityCacheData = JSON.parse(cached);

      // Check if cache is valid
      const isExpired = Date.now() - data.timestamp > CACHE_DURATION;
      const isDifferentAccount = data.accountId !== accountId;
      const isDifferentRegion = data.region !== region;

      if (isExpired || isDifferentAccount || isDifferentRegion) {
        console.log(`Cache invalid for ${categoryId}:`, {
          isExpired,
          isDifferentAccount,
          isDifferentRegion,
        });
        this.clear(categoryId);
        return null;
      }

      console.log(`Loaded cached security data for ${categoryId}`);
      return data;
    } catch (error) {
      console.error('Error loading security cache:', error);
      return null;
    }
  },

  /**
   * Clear cache for specific category
   */
  clear(categoryId: string): void {
    try {
      localStorage.removeItem(this.getCacheKey(categoryId));
      console.log(`Cleared cache for ${categoryId}`);
    } catch (error) {
      console.error('Error clearing security cache:', error);
    }
  },

  /**
   * Clear all security caches
   */
  clearAll(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.startsWith(STORAGE_KEY_PREFIX)) {
          localStorage.removeItem(key);
        }
      });
      console.log('Cleared all security caches');
    } catch (error) {
      console.error('Error clearing all security caches:', error);
    }
  },

  /**
   * Check if cache exists and is valid
   */
  isValid(categoryId: string, accountId: string, region: string): boolean {
    return this.load(categoryId, accountId, region) !== null;
  },
};
