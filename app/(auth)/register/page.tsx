
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export default function RegisterPage() {
  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nama, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Terjadi kesalahan.');
      }

      setSuccess('Registrasi Super Admin berhasil! Anda akan diarahkan ke halaman login...');
      setTimeout(() => {
        router.push('/login');
      }, 3000);

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
              Setup Awal Sistem
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Daftarkan Akun Super Admin Pertama.
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="nama">Nama Lengkap</Label>
              <Input
                id="nama" name="nama" type="text"
                placeholder="Masukkan nama lengkap"
                required value={nama} onChange={(e) => setNama(e.target.value)}
              />
            </div>
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
                placeholder="Minimal 6 karakter"
                required value={password} onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && <p className="text-center text-sm font-medium text-red-600">{error}</p>}
            {success && <p className="text-center text-sm font-medium text-green-600">{success}</p>}

            <Button
              type="submit"
              disabled={isLoading || !!success}
              className="w-full"
            >
              {isLoading ? 'Mendaftarkan...' : 'Daftar Super Admin'}
            </Button>
          </form>
          <p className="mt-8 text-center text-sm text-slate-600">
            Sudah punya akun?{' '}
            <Link href="/login" className="font-semibold text-slate-800 hover:underline">
              Masuk di sini
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