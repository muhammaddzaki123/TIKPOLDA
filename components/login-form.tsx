// components/login-form.tsx

'use client'; // Tambahkan ini di atas karena akan ada interaksi pengguna (event handler, state)

import Link from 'next/link';

export default function LoginForm() {
  return (
    <div className="w-full max-w-sm rounded-xl bg-slate-100 p-8 shadow-lg md:p-12">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-slate-800">Selamat Datang!</h1>
        <p className="text-sm text-slate-600">Masuk ke Akun Anda</p>
      </div>

      <form className="space-y-6">
        <div>
          <label htmlFor="username" className="sr-only">
            Username
          </label>
          <input
            type="text"
            id="username"
            name="username"
            placeholder="Username"
            className="w-full border-b-2 border-slate-300 bg-transparent py-2 text-slate-700 placeholder-slate-400 focus:border-slate-500 focus:outline-none"
            required
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
          />
        </div>

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