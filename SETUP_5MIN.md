# 🎯 QUICK SETUP GUIDE - 5 Menit Setup

## Step 1: Generate NEXTAUTH_SECRET (30 detik)

```bash
npm run generate-secret
```

Copy output yang muncul, contoh:
```
NEXTAUTH_SECRET="Z2fglExjONlvsGFSGLBUJ8vhCmNavcwuqnyDf0RNRKI="
```

## Step 2: Buat File .env (1 menit)

Copy `.env.example` ke `.env`:

```bash
copy .env.example .env
```

Edit `.env` dan paste NEXTAUTH_SECRET yang sudah di-generate:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/poldatik?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="paste-secret-yang-sudah-di-generate-disini"
```

## Step 3: Install Dependencies (2 menit)

```bash
npm install
```

## Step 4: Setup Database (1 menit)

```bash
npx prisma migrate dev
npx prisma generate
```

## Step 5: Run Development Server (30 detik)

```bash
npm run dev
```

Buka browser: **http://localhost:3000**

---

## ✅ Verifikasi Setup Berhasil

### 1. Check Security Headers

Buka DevTools (F12) → Network tab → Refresh page → Click any request → Check Response Headers:

Harus ada:
- ✅ `strict-transport-security`
- ✅ `x-frame-options`
- ✅ `x-content-type-options`
- ✅ `content-security-policy`

### 2. Test Password Validation

Pergi ke `/register` dan coba password lemah seperti `test123`:

✅ **Expected:** Error "Password tidak cukup kuat"

### 3. Test Account Lockout

Login 5x dengan password salah:

✅ **Expected:** "Akun terkunci. Coba lagi dalam 15 menit"

### 4. Check Logs

```bash
dir logs
```

✅ **Expected:** Ada file `combined.log`, `error.log`, `security.log`

---

## 🚨 Troubleshooting

### Error: "Module not found: Can't resolve 'validator'"

```bash
npm install validator @types/validator
```

### Error: "NEXTAUTH_SECRET is not set"

Pastikan file `.env` sudah dibuat dan berisi `NEXTAUTH_SECRET`

### Logs folder tidak muncul

Folder akan otomatis dibuat saat aplikasi pertama kali berjalan. Atau buat manual:

```bash
mkdir logs
```

### TypeScript errors

```bash
npm install --save-dev @types/validator
```

---

## 📚 Dokumentasi Lengkap

Untuk dokumentasi lengkap, lihat:
- `IMPLEMENTATION_SUMMARY.md` - Summary lengkap implementasi
- `SECURITY.md` - Dokumentasi keamanan detail
- `SECURITY_QUICKSTART.md` - Quick start guide extended

---

## 🎉 Done!

Aplikasi sekarang sudah aman dengan:
- ✅ Password policy yang kuat
- ✅ Rate limiting
- ✅ Account lockout
- ✅ Security headers
- ✅ Input validation
- ✅ Logging & monitoring
- ✅ SQL injection protection
- ✅ XSS protection
- ✅ CSRF protection

**Total Setup Time:** ~5 menit

**Security Level:** 🔒🔒🔒🔒🔒 (5/5)

---

Need help? Check `SECURITY.md` atau `IMPLEMENTATION_SUMMARY.md`
