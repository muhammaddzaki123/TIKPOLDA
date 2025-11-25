# Security Features - Aplikasi POLDATIK

## ✅ Fitur Keamanan yang Sudah Diimplementasikan

### 1. **Error Handling & User Feedback**

#### Login Error Messages
- ✅ **Password Salah**: "Password salah. Sisa X percobaan sebelum akun terkunci."
- ✅ **Email Tidak Ditemukan**: "Email tidak ditemukan. Sisa X percobaan sebelum akun terkunci."
- ✅ **Account Lockout**: "Akun terkunci karena terlalu banyak percobaan gagal. Coba lagi dalam X menit."
- ✅ **Sisa Kesempatan**: Sistem menampilkan sisa percobaan (5 kali maksimal)

#### Validation Error Messages
- ✅ Password minimal 12 karakter
- ✅ Password harus mengandung: huruf besar, huruf kecil, angka, dan simbol
- ✅ Email format validation
- ✅ Required field validation

### 2. **Account Lockout System**

```typescript
// Konfigurasi di .env
MAX_LOGIN_ATTEMPTS=5           // Maksimal 5 percobaan gagal
LOCKOUT_DURATION_MINUTES=15    // Terkunci selama 15 menit
```

**Flow:**
1. User salah password → Sisa 4 percobaan
2. User salah password lagi → Sisa 3 percobaan
3. User salah password lagi → Sisa 2 percobaan
4. User salah password lagi → Sisa 1 percobaan
5. User salah password lagi → Akun terkunci 15 menit

**Features:**
- ✅ Counter percobaan gagal per email
- ✅ Auto-unlock setelah 15 menit
- ✅ Reset counter saat login berhasil
- ✅ Tampilkan sisa waktu lockout
- ✅ Logging semua percobaan gagal

### 3. **Cookie Security**

#### Secure Session Cookies
```typescript
cookies: {
  sessionToken: {
    name: '__Secure-next-auth.session-token', // Production
    options: {
      httpOnly: true,        // Tidak bisa diakses JavaScript
      sameSite: 'lax',       // CSRF protection
      path: '/',
      secure: true,          // HTTPS only (production)
    },
  },
}
```

**Cookie Protection:**
- ✅ **httpOnly**: Cookie tidak bisa diakses via JavaScript (XSS protection)
- ✅ **secure**: Cookie hanya dikirim via HTTPS di production
- ✅ **sameSite**: Melindungi dari CSRF attacks
- ✅ **__Secure- prefix**: Browser memastikan cookie hanya via HTTPS

#### JWT Token Security
- ✅ Token disimpan di secure cookie (bukan localStorage)
- ✅ Token ter-encrypt dengan NEXTAUTH_SECRET
- ✅ Token expire otomatis (8 jam)
- ✅ Token refresh setiap 1 jam
- ✅ CSRF token validation built-in NextAuth

### 4. **Rate Limiting**

#### Login Rate Limiting
```typescript
// Middleware: 5 request per 15 menit per IP
if (!checkRateLimit(`login_${ip}`, 5, 900000)) {
  return "Terlalu banyak percobaan login. Coba lagi nanti."
}
```

#### API Rate Limiting
```typescript
// 60 request per menit untuk semua API (kecuali auth)
if (!checkRateLimit(`api_${ip}_${pathname}`, 60, 60000)) {
  return 429 "Terlalu banyak permintaan"
}
```

**Benefits:**
- ✅ Mencegah brute force attacks
- ✅ Mencegah DDoS attacks
- ✅ Mencegah credential stuffing
- ✅ Per-IP dan per-endpoint tracking

### 5. **Input Validation**

#### Password Requirements
```typescript
- Minimal 12 karakter
- Harus ada huruf besar (A-Z)
- Harus ada huruf kecil (a-z)
- Harus ada angka (0-9)
- Harus ada simbol (!@#$%^&*)
```

#### Email Validation
```typescript
- Format email valid (RFC 5322)
- Domain whitelist (optional)
- Sanitization untuk mencegah injection
```

#### SQL Injection Protection
- ✅ Prisma ORM (parameterized queries)
- ✅ Type-safe database queries
- ✅ No raw SQL queries

### 6. **Security Headers**

```typescript
// next.config.ts
headers: [
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Content-Security-Policy': "default-src 'self'; ..."
]
```

**Protection:**
- ✅ HSTS: Force HTTPS
- ✅ X-Frame-Options: Prevent clickjacking
- ✅ X-Content-Type-Options: Prevent MIME sniffing
- ✅ CSP: Prevent XSS attacks
- ✅ Referrer-Policy: Privacy protection

### 7. **Logging & Monitoring**

#### Security Event Logging
```typescript
// logs/security.log
[2025-11-25] SUCCESS: Login berhasil - user@email.com from ::1
[2025-11-25] FAILED: Password salah - user@email.com from ::1 (Attempt 1/5)
[2025-11-25] LOCKOUT: Akun terkunci - user@email.com from ::1 (5 attempts)
```

**Log Events:**
- ✅ Successful logins
- ✅ Failed login attempts
- ✅ Account lockouts
- ✅ Password changes
- ✅ Unauthorized access attempts
- ✅ Rate limit exceeded

### 8. **Session Management**

#### JWT Token Features
- ✅ Token expiry: 8 jam
- ✅ Token refresh: setiap 1 jam
- ✅ loginTime tracking untuk single session
- ✅ Auto-logout saat token expired
- ✅ Redirect ke login saat unauthorized

#### Session Validation
```typescript
// Middleware validasi session di setiap request
if (!token) {
  redirect('/login')
}

if (token.role !== requiredRole) {
  redirect('/unauthorized')
}
```

### 9. **Password Security**

#### Password Hashing
```typescript
// bcryptjs dengan cost factor 12
const hashedPassword = await hash(password, 12)
```

**Features:**
- ✅ bcrypt hashing (cost factor 12)
- ✅ Salt per-password
- ✅ Brute force resistant
- ✅ No plain text passwords in DB

### 10. **CSRF Protection**

#### Built-in NextAuth CSRF
- ✅ CSRF token per session
- ✅ Token validation di setiap POST request
- ✅ SameSite cookie attribute
- ✅ Origin header validation

## 🔒 Testing Security Features

### Test 1: Login dengan Password Salah
```bash
1. Buka http://localhost:3000/login
2. Masukkan email: test@gmail.com
3. Masukkan password: wrong123
4. Klik Login
5. Expected: "Password salah. Sisa 4 percobaan sebelum akun terkunci."
```

### Test 2: Account Lockout
```bash
1. Salah password 5 kali berturut-turut
2. Expected: "Akun terkunci karena terlalu banyak percobaan gagal. Coba lagi dalam 15 menit."
3. Tunggu 15 menit atau restart server
4. Expected: Bisa login lagi
```

### Test 3: Rate Limiting
```bash
# Kirim 61 request dalam 1 menit
for i in {1..61}; do
  curl http://localhost:3000/api/peminjaman
done

# Expected: Request ke-61 mendapat 429 Too Many Requests
```

### Test 4: Cookie Security
```bash
1. Login berhasil
2. Buka DevTools → Application → Cookies
3. Check: __Secure-next-auth.session-token
4. Expected: 
   - HttpOnly: ✓
   - Secure: ✓ (production)
   - SameSite: Lax
```

## 📊 Security Monitoring

### View Security Logs
```bash
# Windows
type logs\security.log

# Linux/Mac
tail -f logs/security.log
```

### Monitor Failed Logins
```bash
# Windows
findstr "FAILED" logs\security.log

# Linux/Mac
grep "FAILED" logs/security.log
```

## 🚨 Security Incident Response

### Account Lockout
1. Check logs: `logs/security.log`
2. Identify IP address
3. Verify legitimate user
4. Manual unlock: Restart server atau tunggu 15 menit

### Brute Force Attack
1. Monitor logs untuk repeated failed attempts
2. Check IP address patterns
3. Add IP to blocklist (future: implement IP blocking)
4. Notify system administrator

### Suspicious Activity
1. Review `logs/security.log`
2. Check for unusual login patterns
3. Verify user accounts
4. Reset passwords jika perlu

## 🔐 Best Practices Implemented

- ✅ Defense in depth (multiple security layers)
- ✅ Least privilege principle
- ✅ Secure by default configuration
- ✅ Input validation at all entry points
- ✅ Output encoding to prevent XSS
- ✅ Parameterized queries to prevent SQL injection
- ✅ HTTPS enforcement in production
- ✅ Security headers for all responses
- ✅ Comprehensive logging and monitoring
- ✅ Regular security updates

## 📝 Environment Variables Required

```env
# Security Configuration
NEXTAUTH_SECRET=<generated-secret>
NEXTAUTH_URL=http://localhost:3000
MAX_LOGIN_ATTEMPTS=5
LOCKOUT_DURATION_MINUTES=15

# Database
DATABASE_URL=<postgresql-connection-string>

# Production
NODE_ENV=production
```

## 🎯 Summary

**Error Handling:** ✅ Complete
- Informative error messages
- Sisa kesempatan login
- Account lockout notifications
- Validation errors

**Cookie Security:** ✅ Complete
- HttpOnly cookies
- Secure cookies (production)
- SameSite CSRF protection
- JWT token encryption

**Rate Limiting:** ✅ Complete
- Login rate limiting (5/15min)
- API rate limiting (60/min)
- Per-IP tracking
- Brute force protection

**Input Validation:** ✅ Complete
- Password strength requirements
- Email format validation
- SQL injection protection (Prisma)
- XSS protection (sanitization)

**Session Management:** ✅ Complete
- Secure JWT tokens
- Auto-logout saat expired
- Role-based access control
- Session timeout (8 hours)

---

**Status:** ✅ Production Ready
**Security Rating:** High
**Last Updated:** 2025-11-25
