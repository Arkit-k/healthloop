'use client';

interface CacheEntry {
  data: unknown;
  timestamp: number;
  ttl: number;
}

interface PendingRequest {
  promise: Promise<Response>;
  timestamp: number;
}

class ApiCache {
  private cache = new Map<string, CacheEntry>();
  private pendingRequests = new Map<string, PendingRequest>();
  private readonly defaultTTL = 5 * 60 * 1000; // 5 minutes

  private generateKey(url: string, options?: RequestInit): string {
    const method = options?.method || 'GET';
    const body = options?.body ? JSON.stringify(options.body) : '';
    return `${method}:${url}:${body}`;
  }

  private isExpired(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }

  async fetch(
    url: string,
    options?: RequestInit & { ttl?: number; skipCache?: boolean }
  ): Promise<Response> {
    const { ttl = this.defaultTTL, skipCache = false, ...fetchOptions } = options || {};
    const cacheKey = this.generateKey(url, fetchOptions);

    // Check cache first (unless skipCache is true)
    if (!skipCache) {
      const cached = this.cache.get(cacheKey);
      if (cached && !this.isExpired(cached)) {
        // Return cached response as a Response-like object
        return new Response(JSON.stringify(cached.data), {
          status: 200,
          statusText: 'OK (cached)',
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // Check for pending request (deduplication)
    const pending = this.pendingRequests.get(cacheKey);
    if (pending && (Date.now() - pending.timestamp) < 30000) { // 30 seconds timeout
      return pending.promise;
    }

    // Create new request
    const promise = fetch(url, fetchOptions).then(async (response) => {
      // Cache successful responses
      if (response.ok && !skipCache) {
        try {
          const data = await response.clone().json();
          this.cache.set(cacheKey, {
            data,
            timestamp: Date.now(),
            ttl
          });
        } catch (e) {
          // Ignore caching errors for non-JSON responses
        }
      }

      // Clean up pending request
      this.pendingRequests.delete(cacheKey);

      return response;
    }).catch((error) => {
      // Clean up pending request on error
      this.pendingRequests.delete(cacheKey);
      throw error;
    });

    // Store pending request for deduplication
    this.pendingRequests.set(cacheKey, {
      promise,
      timestamp: Date.now()
    });

    return promise;
  }

  // Clear expired cache entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }

    // Clean up old pending requests
    for (const [key, pending] of this.pendingRequests.entries()) {
      if (now - pending.timestamp > 30000) {
        this.pendingRequests.delete(key);
      }
    }
  }

  // Clear all cache
  clear(): void {
    this.cache.clear();
    this.pendingRequests.clear();
  }

  // Get cache stats
  getStats(): { cacheSize: number; pendingRequests: number } {
    return {
      cacheSize: this.cache.size,
      pendingRequests: this.pendingRequests.size
    };
  }
}

// Create singleton instance
const apiCache = new ApiCache();

// Auto cleanup every 5 minutes
if (typeof window !== 'undefined') {
  setInterval(() => {
    apiCache.cleanup();
  }, 5 * 60 * 1000);
}

export { apiCache };
export default apiCache;