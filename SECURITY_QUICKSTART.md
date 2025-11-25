# 🚀 Quick Start Guide - POLDATIK Security Implementation

## ⚡ Instalasi Cepat

### 1. Install Dependencies Baru

```bash
npm install
```

Dependencies keamanan yang ditambahkan:
- `zod` - Input validation
- `validator` - String sanitization
- `winston` - Logging system
- `lru-cache` - Rate limiting
- `helmet` - Security headers
- `@upstash/ratelimit` & `@upstash/redis` - Rate limiting (optional for production)

### 2. Setup Environment Variables

Copy `.env.example` ke `.env` dan isi nilai-nilai yang dibutuhkan:

```bash
copy .env.example .env
```

**PENTING:** Generate NEXTAUTH_SECRET yang kuat (minimal 32 karakter):

```powershell
# PowerShell
[Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
```

### 3. Setup Database & Run Migration

```bash
npx prisma migrate dev
npx prisma generate
```

### 4. Jalankan Development Server

```bash
npm run dev
```

## 🔐 Fitur Keamanan Baru

### ✅ Yang Sudah Diterapkan

1. **Password Policy Kuat**
   - Minimal 12 karakter
   - Harus ada huruf besar, kecil, angka, dan karakter spesial
   - Pengecekan password umum

2. **Rate Limiting**
   - Login: 5 percobaan per 15 menit
   - API: 60 requests per menit
   - Registration: 3 per jam

3. **Account Lockout**
   - Terkunci setelah 5 failed attempts
   - Auto-unlock setelah 15 menit

4. **Security Headers**
   - HSTS, CSP, X-Frame-Options, dll
   - Protection dari XSS, Clickjacking, MIME sniffing

5. **Input Validation**
   - Zod schemas untuk semua input
   - SQL Injection protection (Prisma ORM)
   - XSS protection

6. **Logging & Monitoring**
   - Failed login attempts
   - Security events
   - File uploads
   - Unauthorized access

## 📁 File-file Baru yang Ditambahkan

```
lib/
  ├── validation.ts      # Zod schemas & input validation
  ├── security.ts        # Security utilities & account lockout
  ├── rate-limit.ts      # Rate limiting configuration
  └── logger.ts          # Winston logger configuration

app/api/auth/
  └── login-rate-limit/  # Rate limit endpoint

logs/                    # Log files (auto-generated)
  ├── combined.log       # All logs
  ├── error.log          # Error logs
  └── security.log       # Security events

.env.example             # Environment variables template
SECURITY.md              # Dokumentasi keamanan lengkap
```

## 🧪 Testing Security Features

### Test 1: Password Validation

Coba register dengan password lemah:

```bash
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "nama": "Test User",
    "email": "test@example.com",
    "password": "weak123"
  }'
```

✅ **Expected:** Reject dengan pesan error validasi password

### Test 2: Account Lockout

1. Login dengan password salah 5 kali
2. Account akan terkunci
3. Coba login lagi, akan muncul pesan: "Akun terkunci. Coba lagi dalam X menit"

### Test 3: Rate Limiting

Lakukan 6+ request login dalam waktu singkat:

✅ **Expected:** Request ke-6 akan mendapat 429 Too Many Requests

### Test 4: Security Headers

Check headers di browser DevTools (Network tab):

✅ **Expected:** Semua security headers muncul (HSTS, CSP, X-Frame-Options, dll)

## 📊 Monitoring Logs

### Windows PowerShell

```powershell
# Real-time monitoring
Get-Content logs/security.log -Wait -Tail 20

# Check failed logins
Select-String -Path logs/security.log -Pattern "FAILED_LOGIN"

# Check account lockouts
Select-String -Path logs/security.log -Pattern "ACCOUNT_LOCKOUT"

# Check rate limit exceeded
Select-String -Path logs/security.log -Pattern "RATE_LIMIT_EXCEEDED"
```

## 🔧 Konfigurasi

### Adjust Rate Limits

Edit `lib/rate-limit.ts`:

```typescript
export const loginLimiter = rateLimit({
  interval: 15 * 60 * 1000, // 15 menit
  uniqueTokenPerInterval: 500,
});
```

### Adjust Account Lockout

Edit `.env`:

```env
MAX_LOGIN_ATTEMPTS=5
LOCKOUT_DURATION_MINUTES=15
```

### Adjust Password Policy

Edit `lib/validation.ts`:

```typescript
export const passwordSchema = z
  .string()
  .min(12, 'Password minimal 12 karakter')
  // ... customize rules
```

## 🚨 Troubleshooting

### Error: "Cannot find module 'winston'"

```bash
npm install winston lru-cache zod validator
```

### Error: "NEXTAUTH_SECRET not set"

Pastikan `.env` sudah dibuat dan berisi `NEXTAUTH_SECRET`

### Logs folder tidak ada

Folder akan otomatis dibuat saat aplikasi pertama kali log something. Atau buat manual:

```bash
mkdir logs
```

### Rate limiting tidak work di development

Rate limiting menggunakan in-memory cache. Restart server akan reset counter.

## 📖 Dokumentasi Lengkap

Lihat `SECURITY.md` untuk dokumentasi keamanan lengkap.

## ✅ Production Checklist

Sebelum deploy ke production:

- [ ] Set `NODE_ENV=production`
- [ ] Generate strong `NEXTAUTH_SECRET` (32+ chars)
- [ ] Enable HTTPS/TLS
- [ ] Set secure database credentials
- [ ] Review rate limiting values
- [ ] Setup log monitoring
- [ ] Enable CORS dengan whitelist
- [ ] Setup automated backups
- [ ] Test all security features

## 🆘 Support

Jika ada pertanyaan atau issues:
1. Check `SECURITY.md`
2. Review error logs di `logs/error.log`
3. Check console untuk error messages

---

**Security Version:** 1.0.0  
**Last Updated:** November 25, 2025
