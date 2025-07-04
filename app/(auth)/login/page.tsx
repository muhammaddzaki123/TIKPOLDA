// app/page.tsx

import Image from 'next/image';
import LoginForm from '@/components/login-form'; // Import komponen baru

export default function SignInPage() {
  return (
    <main className="grid min-h-screen w-full grid-cols-1 md:grid-cols-2">
      {/* Kolom Kiri: Form Login */}
      <div className="flex items-center justify-center bg-white p-8">
        <LoginForm /> {/* Gunakan komponen di sini */}
      </div>

      {/* Kolom Kanan: Gambar */}
      <div className="hidden items-center justify-center bg-[#0d2436] p-10 md:flex">
        <Image
          src="/gambarawal.svg" // Pastikan path gambar benar
          alt="Polda NTB Display"
          width={500}
          height={500}
          quality={100}
          priority
        />
      </div>
    </main>
  );
}