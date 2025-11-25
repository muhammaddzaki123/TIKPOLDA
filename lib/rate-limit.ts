// lib/rate-limit.ts

import { LRUCache } from 'lru-cache';

type RateLimitOptions = {
  uniqueTokenPerInterval?: number;
  interval?: number;
};

export default function rateLimit(options?: RateLimitOptions) {
  const tokenCache = new LRUCache({
    max: options?.uniqueTokenPerInterval || 500,
    ttl: options?.interval || 60000,
  });

  return {
    check: (limit: number, token: string): Promise<void> =>
      new Promise((resolve, reject) => {
        const tokenCount = (tokenCache.get(token) as number[]) || [0];
        if (tokenCount[0] === 0) {
          tokenCache.set(token, tokenCount);
        }
        tokenCount[0] += 1;

        const currentUsage = tokenCount[0];
        const isRateLimited = currentUsage >= limit;

        return isRateLimited ? reject() : resolve();
      }),
  };
}

// Rate limiters untuk berbagai endpoint
export const loginLimiter = rateLimit({
  interval: 15 * 60 * 1000, // 15 menit
  uniqueTokenPerInterval: 500,
});

export const apiLimiter = rateLimit({
  interval: 60 * 1000, // 1 menit
  uniqueTokenPerInterval: 500,
});

export const strictLimiter = rateLimit({
  interval: 60 * 60 * 1000, // 1 jam
  uniqueTokenPerInterval: 100,
});
