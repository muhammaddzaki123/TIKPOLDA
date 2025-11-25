# 🔧 Build & Deployment Troubleshooting

## Common Build Issues

### 1. EPERM: operation not permitted (Prisma)

**Error:**
```
EPERM: operation not permitted, rename 'query_engine-windows.dll.node.tmp' -> 'query_engine-windows.dll.node'
```

**Penyebab:** Dev server masih running dan menggunakan Prisma client.

**Solusi:**
```bash
# Windows
taskkill /F /IM node.exe
timeout /t 2
npm run build

# atau restart terminal dan build lagi
```

---

### 2. Edge Runtime Module Error

**Error:**
```
Error: The edge runtime does not support Node.js 'path' module.
```

**Penyebab:** Middleware menggunakan Node.js modules yang tidak compatible dengan Edge Runtime.

**Solusi:** ✅ Sudah diperbaiki di `middleware.ts` - tidak lagi menggunakan winston atau Node.js modules.

---

### 3. Image Quality Warning

**Warning:**
```
Image with src "/gambarawal.svg" is using quality "100" which is not configured
```

**Solusi:** ✅ Sudah diperbaiki di `next.config.ts` - menambahkan `qualities: [100]`

---

### 4. NEXTAUTH_URL Warning

**Warning:**
```
[next-auth][warn][NEXTAUTH_URL]
https://next-auth.js.org/warnings#nextauth_url
```

**Solusi:** Pastikan `.env` memiliki `NEXTAUTH_URL`:
```env
NEXTAUTH_URL="http://localhost:3000"  # Development
NEXTAUTH_URL="https://yourdomain.com"  # Production
```

---

## Build Process

### Development Build
```bash
npm run dev
```

### Production Build
```bash
# 1. Stop all running processes
taskkill /F /IM node.exe

# 2. Clean cache (optional)
rmdir /s /q .next
rmdir /s /q node_modules\.prisma

# 3. Build
npm run build

# 4. Start production server
npm start
```

---

## Pre-deployment Checklist

- [ ] Stop all dev servers
- [ ] Set environment variables
  - [ ] `DATABASE_URL`
  - [ ] `NEXTAUTH_URL`
  - [ ] `NEXTAUTH_SECRET`
- [ ] Run `npm run lint` (no errors)
- [ ] Run `npm run build` (successful)
- [ ] Test production build locally (`npm start`)
- [ ] Check logs folder exists
- [ ] Verify security features working

---

## Build Commands Explained

### `npm run build`
```json
"build": "prisma migrate deploy && prisma generate && next build"
```

1. **`prisma migrate deploy`** - Apply database migrations
2. **`prisma generate`** - Generate Prisma Client
3. **`next build`** - Build Next.js application

### Common Issues per Step

#### Step 1: prisma migrate deploy
- **Issue:** Database connection failed
- **Fix:** Check `DATABASE_URL` in `.env`

#### Step 2: prisma generate
- **Issue:** EPERM error
- **Fix:** Stop all node processes

#### Step 3: next build
- **Issue:** TypeScript errors
- **Fix:** Run `npm run lint` first to check

---

## Port Already in Use

**Error:**
```
Port 3000 is in use
```

**Solutions:**

### Option 1: Kill process on port
```bash
# Windows
netstat -ano | findstr :3000
taskkill /F /PID <PID>
```

### Option 2: Use different port
```bash
# .env
PORT=3001
```

### Option 3: Let Next.js choose
Next.js will automatically use next available port (3001, 3002, etc.)

---

## Clean Build

Jika build terus error, lakukan clean build:

```bash
# 1. Stop all processes
taskkill /F /IM node.exe

# 2. Delete build artifacts
rmdir /s /q .next
rmdir /s /q node_modules\.prisma

# 3. Reinstall dependencies (optional)
rmdir /s /q node_modules
npm install

# 4. Build fresh
npm run build
```

---

## Production Deployment

### Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Docker
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Manual Server
```bash
# Build locally
npm run build

# Upload ke server
# - .next/
# - public/
# - package.json
# - prisma/

# On server
npm ci --only=production
npm start
```

---

## Environment-specific Builds

### Development
```env
NODE_ENV=development
NEXTAUTH_URL=http://localhost:3000
```

### Production
```env
NODE_ENV=production
NEXTAUTH_URL=https://yourdomain.com
# Add production secrets
```

---

## Build Optimization Tips

1. **Enable SWC minification** (already enabled by default in Next.js 15)
2. **Use production database** for production builds
3. **Enable caching** in CI/CD
4. **Use `.env.production`** for production-specific configs
5. **Monitor build time** - should be < 2 minutes for this app

---

## Monitoring Build Success

### Successful Build Output:
```
✓ Compiled successfully
✓ Collecting page data
✓ Generating static pages
✓ Finalizing page optimization

Route (app)                              Size
┌ ○ /                                   XX kB
├ ○ /login                              XX kB
├ ○ /dashboard                          XX kB
...

○  (Static)  prerendered as static HTML
```

### Build Metrics:
- **Build time:** < 2 minutes
- **Total size:** < 10 MB
- **First Load JS:** < 200 kB per route

---

**Last Updated:** November 25, 2025
