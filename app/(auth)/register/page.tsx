// app/(auth)/register/page.tsx

'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const response = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nama, email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.message || 'Terjadi kesalahan saat registrasi.');
    } else {
      setSuccess('Registrasi berhasil! Anda akan diarahkan ke halaman login.');
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    }
  };

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-gray-100">
      <div className="w-full max-w-sm rounded-xl bg-white p-8 shadow-lg md:p-12">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-slate-800">Daftar Akun Baru</h1>
          <p className="text-sm text-slate-600">Pengguna pertama akan menjadi Super Admin.</p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <input
              type="text"
              placeholder="Nama Lengkap"
              className="w-full border-b-2 border-slate-300 bg-transparent py-2 text-slate-700 placeholder-slate-400 focus:border-slate-500 focus:outline-none"
              required
              value={nama}
              onChange={(e) => setNama(e.target.value)}
            />
          </div>
          <div>
            <input
              type="email"
              placeholder="Email"
              className="w-full border-b-2 border-slate-300 bg-transparent py-2 text-slate-700 placeholder-slate-400 focus:border-slate-500 focus:outline-none"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Password"
              className="w-full border-b-2 border-slate-300 bg-transparent py-2 text-slate-700 placeholder-slate-400 focus:border-slate-500 focus:outline-none"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          
          {error && <p className="text-center text-sm text-red-600">{error}</p>}
          {success && <p className="text-center text-sm text-green-600">{success}</p>}

          <button
            type="submit"
            className="w-full rounded-lg bg-slate-800 py-3 font-semibold text-white shadow-md transition-colors hover:bg-slate-700"
          >
            Daftar
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-600">
          Sudah punya akun?{' '}
          <Link href="/login" className="font-semibold text-slate-800 hover:underline">
            Masuk
          </Link>
        </p>
      </div>
    </main>
  );
}