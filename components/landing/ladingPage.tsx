import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const LandingPage: React.FC = () => {
  return (
    <section className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50/50 to-indigo-50/30 py-8 sm:py-12 md:py-16 relative overflow-hidden">
      {/* Tech Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.05)_1px,transparent_1px)] bg-[size:64px_64px]"></div>
      
      {/* Animated Gradient Orbs */}
      <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-gradient-to-br from-blue-400/15 via-cyan-400/10 to-transparent rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-indigo-400/15 via-blue-400/10 to-transparent rounded-full blur-3xl animate-pulse" style={{animationDelay: '1.5s'}}></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-cyan-400/8 via-blue-400/8 to-indigo-400/8 rounded-full blur-3xl"></div>
      <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-16 relative z-10">
        <div className="flex flex-col-reverse lg:flex-row items-center gap-8 sm:gap-10 md:gap-12 lg:gap-24">
          {/* Left: Content */}
          <div className="w-full lg:w-1/2 max-w-2xl space-y-4 sm:space-y-5 md:space-y-6 text-center lg:text-left">
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 leading-tight">
              <span className="text-slate-600 text-base sm:text-lg md:text-xl lg:text-2xl font-normal block mb-1 sm:mb-2">Selamat Datang di</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600">Sistem Logistik POLDA NTB</span>
            </h1>

            <p className="text-slate-700 text-sm sm:text-base md:text-lg leading-relaxed px-2 sm:px-0">
              Sistem internal untuk manajemen inventaris, peminjaman, dan pelaporan logistik POLDA NTB.
            </p>

            <div className="flex flex-col sm:flex-row flex-wrap justify-center lg:justify-start gap-3 sm:gap-4 pt-2">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] shadow-lg font-semibold cursor-pointer w-full sm:w-auto"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                  <path d="M15 14a4 4 0 10-6 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M12 7v.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="text-sm font-medium">Daftar</span>
              </Link>

              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 border-2 border-slate-300 text-slate-700 px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl hover:border-cyan-500 hover:bg-cyan-50 hover:text-cyan-600 transition-all duration-300 transform hover:-translate-y-1 font-semibold cursor-pointer w-full sm:w-auto"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                  <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M10 17l5-5-5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M15 12H3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="text-sm font-medium">Masuk</span>
              </Link>
            </div>



            <ul className="mt-6 sm:mt-7 md:mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-5">
              <li className="flex gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl bg-white/70 backdrop-blur-sm border border-slate-200 hover:border-cyan-400 hover:shadow-[0_8px_30px_rgba(6,182,212,0.15)] transition-all group">
                <span className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-transform flex-shrink-0">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                    <path d="M3 7h18" stroke="white" strokeWidth="2" strokeLinecap="round" />
                    <path d="M6 11h12" stroke="white" strokeWidth="2" strokeLinecap="round" />
                    <path d="M9 15h6" stroke="white" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </span>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 mb-1">Manajemen Inventaris</h4>
                  <p className="text-xs text-slate-600">Kelola stok, kategori, dan kondisi barang.</p>
                </div>
              </li>
              <li className="flex gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl bg-white/70 backdrop-blur-sm border border-slate-200 hover:border-indigo-400 hover:shadow-[0_8px_30px_rgba(99,102,241,0.15)] transition-all group">
                <span className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 shadow-lg group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-transform flex-shrink-0">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                    <path d="M12 6v6l4 2" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="12" cy="12" r="9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 mb-1">Riwayat & Laporan</h4>
                  <p className="text-xs text-slate-600">Riwayat peminjaman dan ekspor laporan.</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Right: Visual */}
          <div className="w-full lg:w-1/2 flex justify-center relative mt-8 lg:mt-0">
            <div className="relative w-full max-w-sm sm:max-w-md lg:max-w-lg px-4 sm:px-0">
              <div className="absolute -left-12 -top-12 w-56 h-56 rounded-full bg-gradient-to-tr from-cyan-500/30 to-blue-600/30 blur-3xl animate-pulse" />
              <div className="absolute -right-10 -bottom-10 w-48 h-48 rounded-full bg-gradient-to-br from-indigo-500/30 to-blue-600/30 blur-3xl animate-pulse" style={{animationDelay: '1s'}} />

              <div className="relative bg-gradient-to-br from-white to-blue-50/50 rounded-3xl shadow-[0_20px_60px_rgba(59,130,246,0.15)] overflow-hidden border border-blue-200/50 hover:shadow-[0_20px_80px_rgba(6,182,212,0.25)] hover:border-cyan-300/50 transition-all duration-500">
                <Image
                  src="/gambarawal.svg"
                  alt="Ilustrasi sistem logistik POLDA NTB"
                  width={900}
                  height={580}
                  className="w-full h-auto object-cover"
                  priority
                />

                <div className="absolute left-3 sm:left-4 md:left-6 bottom-3 sm:bottom-4 md:bottom-6 bg-white/95 backdrop-blur-md rounded-lg sm:rounded-xl px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 md:py-3 shadow-[0_8px_30px_rgba(6,182,212,0.2)] border border-cyan-200/50">
                  <div className="text-[10px] sm:text-xs font-medium text-slate-600">Active Users</div>
                  <div className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">128</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingPage;
