# 🌙 Dark Mode Implementation Guide

## Fitur Dark Mode

Sistem dark mode telah diterapkan pada dashboard Super Admin dan Admin Satker dengan fitur berikut:

### ✨ Fitur Utama
- **Toggle Button**: Tombol Sun/Moon di header untuk beralih tema
- **Persistent Storage**: Preferensi tema disimpan di localStorage
- **System Detection**: Otomatis mendeteksi preferensi sistem operasi
- **Smooth Transitions**: Animasi halus saat berganti tema
- **Comprehensive Coverage**: Semua komponen dashboard mendukung dark mode

## 📁 File yang Dimodifikasi

### 1. Context & Provider
- **`contexts/ThemeContext.tsx`** (NEW)
  - Theme provider dengan React Context
  - Custom hook `useTheme()` untuk akses tema
  - localStorage persistence
  - System preference detection

### 2. Layout Components
- **`app/dashboard/layout.tsx`**
  - Wrapped dengan ThemeProvider
  - Added dark mode background classes
  
- **`app/satker-admin/layout.tsx`**
  - Wrapped dengan ThemeProvider
  - Added dark mode background classes

### 3. UI Components
- **`components/header-dashboard.tsx`**
  - Added theme toggle button (Sun/Moon icon)
  - Dark mode styling untuk header, menu, dan dropdown
  
- **`components/stat-card.tsx`**
  - Dark mode untuk stat cards
  - `dark:bg-slate-800`, `dark:text-slate-100`
  
- **`components/dashboard/DashboardClient.tsx`**
  - Dark mode untuk dialog modals
  
- **`components/dashboard/Charts.tsx`**
  - Dark mode untuk ChartCard component
  
- **`components/dashboard/ActivityTimeline.tsx`**
  - Dark mode untuk activity timeline card

### 4. Existing Dark Support
- **Sidebar Components**: Sudah menggunakan dark theme by default
- **Table Components**: Menggunakan semantic colors (foreground, muted)
- **Card Components**: Menggunakan semantic colors yang auto-adapt

## 🎨 Color Scheme

### Light Mode
- Background: White (`bg-white`)
- Text: Slate-900/Slate-800 (`text-slate-900`)
- Cards: White dengan shadow
- Borders: Slate-200 (`border-slate-200`)

### Dark Mode
- Background: Slate-900 (`dark:bg-slate-900`)
- Text: Slate-100/Slate-200 (`dark:text-slate-100`)
- Cards: Slate-800 (`dark:bg-slate-800`)
- Borders: Slate-700 (`dark:border-slate-700`)

## 🔧 Cara Penggunaan

### Menggunakan Theme Context di Component Baru

```tsx
'use client';

import { useTheme } from '@/contexts/ThemeContext';

export function MyComponent() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <div>
      <p>Current theme: {theme}</p>
      <button onClick={toggleTheme}>
        Toggle Theme
      </button>
    </div>
  );
}
```

### Menambahkan Dark Mode ke Component Baru

```tsx
// Tambahkan class dark: untuk styling alternatif
<div className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">
  Content
</div>

// Untuk borders
<div className="border border-slate-200 dark:border-slate-700">
  Content
</div>

// Untuk shadows
<div className="shadow-md dark:shadow-slate-900/50">
  Content
</div>
```

## 🎯 Best Practices

1. **Gunakan Semantic Colors**: Gunakan `text-foreground`, `bg-background` untuk komponen yang bisa reusable
2. **Consistent Naming**: Gunakan slate-800/900 untuk dark backgrounds, slate-100/200 untuk dark text
3. **Test Both Modes**: Selalu test komponen di light dan dark mode
4. **Gradients Stay Bright**: Gradient backgrounds (seperti PremiumStatCard) tetap menggunakan warna cerah
5. **Smooth Transitions**: Tambahkan `transition-colors` untuk smooth animation

## 🚀 Next Steps (Optional Enhancements)

1. **Auto-switch at specific times** (e.g., malam otomatis dark)
2. **Multiple theme presets** (blue, purple, green themes)
3. **High contrast mode** untuk accessibility
4. **Per-page theme preferences**
5. **Theme sync across tabs** menggunakan BroadcastChannel

## 📱 Testing Checklist

- [ ] Toggle button bekerja di header
- [ ] Tema tersimpan setelah reload page
- [ ] System preference detection bekerja
- [ ] Semua stat cards readable di dark mode
- [ ] Charts tetap visible di dark mode
- [ ] Activity timeline readable di dark mode
- [ ] Dropdown menus styled correctly
- [ ] Modals/Dialogs support dark mode
- [ ] Tables readable di dark mode
- [ ] Forms dan inputs support dark mode

## 🎨 Tailwind Dark Mode

Proyek ini menggunakan Tailwind CSS v4 dengan:
- **Dark mode strategy**: `class` (via `.dark` class)
- **Custom variant**: `@custom-variant dark (&:is(.dark *))`
- **CSS Variables**: Semua warna defined di `:root` dan `.dark`
- **Automatic color conversion**: oklch color space

File config: `app/globals.css`

---

**Developed for POLDA NTB Logistic Management System**
