// app/(auth)/login/page.tsx

'use client';

import Link from 'next/link';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Memanggil NextAuth untuk proses otentikasi
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
        callbackUrl: '/dashboard',
      });

      if (result?.error) {
        // Jika NextAuth mengembalikan error (cth: kredensial salah atau akun terkunci)
        throw new Error(result.error);
      }

      if (result?.ok) {
        // Redirect dengan full page reload untuk memastikan cookie ter-set
        window.location.href = result.url || '/dashboard';
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Terjadi kesalahan yang tidak diketahui.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="relative grid min-h-screen w-full grid-cols-1 lg:grid-cols-2 overflow-hidden">
      {/* Home Button */}
      <Link 
        href="/"
        className="fixed top-4 left-4 sm:top-6 sm:left-6 z-50 group"
      >
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900/80 backdrop-blur-xl border border-white/10 hover:border-blue-500/50 transition-all duration-300 hover:shadow-[0_0_20px_rgba(37,99,235,0.3)]">
          <svg className="w-5 h-5 text-slate-400 group-hover:text-blue-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="text-sm font-semibold text-slate-300 group-hover:text-white transition-colors">Home</span>
        </div>
      </Link>

      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950">
        {/* Animated Mesh Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e40af20_1px,transparent_1px),linear-gradient(to_bottom,#1e40af20_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]"></div>
        
        {/* Animated Gradient Orbs */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-blue-600/20 via-blue-500/15 to-transparent rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-slate-700/20 via-blue-600/15 to-transparent rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>

      {/* Left Side - Form */}
      <div className="relative flex items-center justify-center p-4 sm:p-6 md:p-8 lg:p-12">
        <div className="w-full max-w-md">
          {/* Logo/Badge */}
          <div className="mb-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-slate-700/10 backdrop-blur-sm border border-blue-500/30 text-blue-300 text-sm font-medium mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              Sistem Internal POLDA NTB
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
              Selamat Datang <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">Kembali</span>
            </h1>
            <p className="text-slate-400 text-sm sm:text-base">
              Masuk untuk melanjutkan ke dashboard Anda
            </p>
          </div>

          {/* Form Card */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-slate-700 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-500"></div>
            <div className="relative bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-white/10 p-6 sm:p-8 shadow-2xl">
              <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-300 font-medium">Email</Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                      </svg>
                    </div>
                    <Input
                      id="email" name="email" type="email"
                      placeholder="email@polda.ntb"
                      required value={email} onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                      className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20 h-12"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-slate-300 font-medium">Password</Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <Input
                      id="password" name="password" type="password"
                      placeholder="Masukkan password Anda"
                      required value={password} onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                      className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20 h-12"
                    />
                  </div>
                </div>
                
                {error && (
                  <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3">
                    <p className="text-center text-sm font-medium text-red-400">{error}</p>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(37,99,235,0.4)] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Memverifikasi...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                      Masuk
                    </span>
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-slate-400">
                  Pengguna pertama?{' '}
                  <Link href="/register" className="font-semibold text-blue-400 hover:text-blue-300 transition-colors">
                    Daftar Super Admin
                  </Link>
                </p>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-8 text-center">
            <p className="text-xs text-slate-500">
              © 2025 POLDA NTB. Sistem Manajemen Logistik Internal.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Visual */}
      <div className="hidden lg:flex relative items-center justify-center p-10">
        <div className="relative w-full max-w-2xl">
          {/* Glow effects */}
          <div className="absolute -left-20 -top-20 w-96 h-96 rounded-full bg-gradient-to-tr from-blue-600/30 to-blue-700/30 blur-3xl animate-pulse" />
          <div className="absolute -right-20 -bottom-20 w-96 h-96 rounded-full bg-gradient-to-br from-slate-600/30 to-slate-700/30 blur-3xl animate-pulse" style={{animationDelay: '1s'}} />

          {/* Main visual card */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-blue-700 to-slate-700 rounded-3xl blur opacity-75 group-hover:opacity-100 transition duration-1000 animate-pulse"></div>
            
            <div className="relative bg-gradient-to-br from-slate-900/90 to-blue-950/90 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/10 p-8">
              <div className="relative">
                <Image
                  src="/gambarawal.svg"
                  alt="POLDA NTB"
                  width={600}
                  height={600}
                  quality={100}
                  priority
                  className="w-full h-auto opacity-90 group-hover:opacity-100 transition-opacity duration-500"
                />
              </div>

              {/* Info overlay */}
              <div className="absolute bottom-8 left-8 right-8">
                <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl p-5 border border-white/20">
                  <h3 className="text-xl font-bold text-white mb-2">Sistem Logistik Terpadu</h3>
                  <p className="text-sm text-slate-300">Manajemen inventaris, peminjaman, dan pelaporan yang terintegrasi untuk POLDA NTB</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}