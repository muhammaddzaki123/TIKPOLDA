// components/login-form.tsx

'use client'; 

import Link from 'next/link';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const result = await signIn('credentials', {
      redirect: false, // Kita handle redirect secara manual
      email,
      password,
    });

    if (result?.error) {
      setError('Email atau password salah. Silakan coba lagi.');
      return;
    }

    // Redirect ke dashboard setelah login berhasil
    // Nanti bisa dibuat lebih canggih berdasarkan role
    router.replace('/dashboard'); 
  };

  return (
    <div className="w-full max-w-sm rounded-xl bg-slate-100 p-8 shadow-lg md:p-12">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-slate-800">Selamat Datang!</h1>
        <p className="text-sm text-slate-600">Masuk ke Akun Anda</p>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email" className="sr-only">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="Email"
            className="w-full border-b-2 border-slate-300 bg-transparent py-2 text-slate-700 placeholder-slate-400 focus:border-slate-500 focus:outline-none"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="password" className="sr-only">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            placeholder="Password"
            className="w-full border-b-2 border-slate-300 bg-transparent py-2 text-slate-700 placeholder-slate-400 focus:border-slate-500 focus:outline-none"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        
        {error && (
          <p className="text-center text-sm text-red-600">{error}</p>
        )}

        <button
          type="submit"
          className="w-full rounded-lg bg-slate-800 py-3 font-semibold text-white shadow-md transition-colors hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
        >
          Masuk
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-slate-600">
        Belum memiliki akun?{' '}
        <Link href="/register" className="font-semibold text-slate-800 hover:underline">
          Daftar
        </Link>
      </p>
    </div>
  );
}