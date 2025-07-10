// app/(auth)/login/page.tsx

'use client';

import Link from 'next/link';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        redirect: false, // Kita handle redirect secara manual
        email,
        password,
      });

      if (result?.error) {
        throw new Error('Email atau password salah. Silakan coba lagi.');
      }
      
      // Arahkan ke halaman utama setelah login berhasil.
      // Middleware akan menangani pengalihan berdasarkan peran.
      router.replace('/');

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="grid min-h-screen w-full grid-cols-1 md:grid-cols-2">
       <div className="flex items-center justify-center bg-gray-50 p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Selamat Datang Kembali
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Masuk untuk melanjutkan ke dashboard Anda.
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email" name="email" type="email"
                placeholder="email@polda.ntb"
                required value={email} onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password" name="password" type="password"
                placeholder="Masukkan password Anda"
                required value={password} onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            
            {error && <p className="text-center text-sm font-medium text-red-600">{error}</p>}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Memverifikasi...' : 'Masuk'}
            </Button>
          </form>
          <p className="mt-8 text-center text-sm text-slate-600">
            Pengguna pertama?{' '}
            <Link href="/register" className="font-semibold text-slate-800 hover:underline">
              Daftar Super Admin
            </Link>
          </p>
        </div>
      </div>
      <div className="hidden items-center justify-center bg-[#0d2436] p-10 md:flex">
        <Image
          src="/gambarawal.svg"
          alt="POLDA NTB"
          width={500}
          height={500}
          quality={100}
          priority
        />
      </div>
    </main>
  );
}