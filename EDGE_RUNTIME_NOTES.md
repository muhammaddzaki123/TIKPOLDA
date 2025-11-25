# ⚠️ IMPORTANT: Edge Runtime Compatibility

## Middleware dan Edge Runtime

Middleware Next.js berjalan di **Edge Runtime**, bukan Node.js runtime. Ini berarti:

❌ **TIDAK BISA digunakan di middleware:**
- Winston logger (`lib/logger.ts`)
- File system operations
- Node.js built-in modules (`path`, `fs`, `crypto`, dll)
- Heavy npm packages yang depend pada Node.js modules

✅ **BISA digunakan di middleware:**
- Simple rate limiting dengan Map
- console.log/warn/error
- NextResponse/NextRequest
- Headers manipulation
- Basic string operations

## Solusi yang Diterapkan

### 1. Middleware (`middleware.ts`)
- ✅ Menggunakan `console.warn()` untuk logging (Edge-compatible)
- ✅ In-memory Map untuk rate limiting
- ✅ Simple IP detection tanpa external libraries
- ✅ Tidak menggunakan winston atau Node.js modules

### 2. API Routes (`app/api/**/route.ts`)
- ✅ Dapat menggunakan winston logger
- ✅ Dapat menggunakan semua lib/security.ts functions
- ✅ Dapat menggunakan lib/rate-limit.ts
- ✅ Full Node.js runtime support

### 3. Server Components & Server Actions
- ✅ Full Node.js runtime support
- ✅ Dapat menggunakan semua security utilities

## Logging Strategy

### Middleware (Edge Runtime)
```typescript
// Gunakan console.log/warn/error
console.warn('[SECURITY] Rate limit exceeded:', ip);
console.error('[ERROR] Authentication failed:', error);
```

### API Routes (Node.js Runtime)
```typescript
// Gunakan winston logger
import { securityLogger } from '@/lib/logger';

securityLogger.logFailedLogin(email, ip, reason);
securityLogger.logRateLimitExceeded(identifier, endpoint, ip);
```

## Rate Limiting Strategy

### Middleware (Edge Runtime)
```typescript
// Simple in-memory Map
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

const checkRateLimit = (key: string, limit: number, windowMs: number): boolean => {
  // Implementation in middleware.ts
};
```

### API Routes (Node.js Runtime)
```typescript
// LRU Cache with more features
import { loginLimiter, apiLimiter } from '@/lib/rate-limit';

await loginLimiter.check(5, `login_${ip}_${email}`);
```

## Production Considerations

### Development
- In-memory rate limiting (resets on restart)
- Console logging sudah cukup
- Edge Runtime middleware sudah optimal

### Production
- **Redis untuk rate limiting** (persistent across instances)
- **External logging service** (Datadog, LogRocket, Sentry)
- **CloudFlare atau CDN** untuk additional DDoS protection

## Migration Notes

Jika Anda ingin logging lebih lengkap di middleware:

### Option 1: External Logging Service
```typescript
// middleware.ts
import { track } from '@vercel/analytics/server';

export async function middleware(req: NextRequest) {
  // Track events to Vercel Analytics
  track('rate_limit_exceeded', { ip, pathname });
}
```

### Option 2: Queue-based Logging
```typescript
// middleware.ts
export async function middleware(req: NextRequest) {
  // Send log to API endpoint
  fetch('/api/internal/log', {
    method: 'POST',
    body: JSON.stringify({ type: 'rate_limit', ip, pathname })
  });
}
```

### Option 3: Move to App Router Middleware Pattern
```typescript
// app/api/[...path]/route.ts
// Handle semua API routing di satu file dengan full Node.js runtime
```

## Current Implementation Status

✅ **Middleware**: Edge-compatible (console logging only)  
✅ **API Routes**: Full logging with Winston  
✅ **Rate Limiting**: Working in both contexts  
✅ **Security**: All features working  

## Testing

```bash
# Test middleware
npm run dev
# Check console for [SECURITY] logs

# Test API routes
# Check logs/ folder for winston logs
dir logs
Get-Content logs/security.log -Wait
```

---

**Updated:** November 25, 2025  
**Status:** ✅ Edge Runtime Compatible
