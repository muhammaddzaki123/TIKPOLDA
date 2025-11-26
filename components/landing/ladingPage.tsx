import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const LandingPage: React.FC = () => {
  return (
    <section className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 py-8 sm:py-12 md:py-16 relative overflow-hidden">
      {/* Animated Mesh Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e40af20_1px,transparent_1px),linear-gradient(to_bottom,#1e40af20_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]"></div>
      
      {/* Animated Gradient Orbs - Blue theme */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-blue-600/20 via-blue-500/15 to-transparent rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-slate-700/20 via-blue-600/15 to-transparent rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-to-r from-blue-500/15 via-slate-600/10 to-blue-600/15 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      
      {/* Floating particles - Blue theme */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400 rounded-full animate-ping opacity-60"></div>
        <div className="absolute top-1/3 right-1/3 w-3 h-3 bg-blue-500 rounded-full animate-ping opacity-60" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-1/4 right-1/4 w-2 h-2 bg-slate-400 rounded-full animate-ping opacity-60" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-1/3 left-1/3 w-3 h-3 bg-blue-600 rounded-full animate-ping opacity-60" style={{animationDelay: '1.5s'}}></div>
      </div>
      <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-16 relative z-10">
        <div className="flex flex-col-reverse lg:flex-row items-center gap-8 sm:gap-10 md:gap-12 lg:gap-24">
          {/* Left: Content */}
          <div className="w-full lg:w-1/2 max-w-2xl space-y-4 sm:space-y-5 md:space-y-6 text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-slate-700/10 backdrop-blur-sm border border-blue-500/30 text-blue-300 text-xs sm:text-sm font-medium mx-auto lg:mx-0">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              Sistem Internal POLDA NTB
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight">
              <span className="text-slate-300 text-lg sm:text-xl md:text-2xl lg:text-3xl font-medium block mb-2 sm:mb-3">Selamat Datang di</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-200 to-slate-300 animate-gradient">
                Sistem Logistik
              </span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 animate-gradient">
                POLDA NTB
              </span>
            </h1>

            <p className="text-slate-300 text-base sm:text-lg md:text-xl leading-relaxed px-2 sm:px-0 font-light">
              Platform modern untuk <span className="text-blue-400 font-semibold">manajemen inventaris</span>, <span className="text-white font-semibold">peminjaman</span>, dan <span className="text-slate-200 font-semibold">pelaporan logistik</span> yang terintegrasi.
            </p>

            <div className="flex flex-col sm:flex-row flex-wrap justify-center lg:justify-start gap-3 sm:gap-4 pt-4">
              <Link
                href="/register"
                className="group relative inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 via-blue-700 to-slate-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-2xl font-bold overflow-hidden transition-all duration-300 transform hover:scale-105 hover:shadow-[0_0_40px_rgba(37,99,235,0.6)] w-full sm:w-auto"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-blue-700 via-blue-800 to-slate-800 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="relative z-10" aria-hidden>
                  <path d="M15 14a4 4 0 10-6 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M12 7v.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="relative z-10">Daftar Sekarang</span>
              </Link>

              <Link
                href="/login"
                className="group inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-md text-white px-6 sm:px-8 py-3 sm:py-4 rounded-2xl hover:bg-white/20 border-2 border-white/20 hover:border-blue-400/50 transition-all duration-300 transform hover:scale-105 font-bold w-full sm:w-auto"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="group-hover:translate-x-1 transition-transform" aria-hidden>
                  <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M10 17l5-5-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M15 12H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>Masuk</span>
              </Link>
            </div>



            <ul className="mt-6 sm:mt-7 md:mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              <li className="group flex gap-4 p-5 rounded-2xl bg-gradient-to-br from-blue-500/10 to-slate-700/5 backdrop-blur-xl border border-blue-500/20 hover:border-blue-400/50 hover:shadow-[0_8px_30px_rgba(37,99,235,0.3)] transition-all duration-300 transform hover:-translate-y-2">
                <span className="flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 shadow-lg group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] transition-all duration-300 flex-shrink-0">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                    <path d="M3 7h18" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                    <path d="M6 11h12" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                    <path d="M9 15h6" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                </span>
                <div>
                  <h4 className="text-base font-bold text-white mb-1.5 group-hover:text-blue-300 transition-colors">Manajemen Inventaris</h4>
                  <p className="text-sm text-slate-400">Kelola stok, kategori, dan kondisi barang secara real-time.</p>
                </div>
              </li>
              <li className="group flex gap-4 p-5 rounded-2xl bg-gradient-to-br from-slate-700/10 to-slate-600/5 backdrop-blur-xl border border-slate-500/20 hover:border-slate-400/50 hover:shadow-[0_8px_30px_rgba(71,85,105,0.3)] transition-all duration-300 transform hover:-translate-y-2">
                <span className="flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-slate-600 to-slate-700 shadow-lg group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(71,85,105,0.5)] transition-all duration-300 flex-shrink-0">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                    <path d="M12 6v6l4 2" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="12" cy="12" r="9" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <div>
                  <h4 className="text-base font-bold text-white mb-1.5 group-hover:text-slate-300 transition-colors">Riwayat & Laporan</h4>
                  <p className="text-sm text-slate-400">Riwayat peminjaman dan ekspor laporan otomatis.</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Right: Visual */}
          <div className="w-full lg:w-1/2 flex justify-center relative mt-8 lg:mt-0">
            <div className="relative w-full max-w-sm sm:max-w-md lg:max-w-lg px-4 sm:px-0">
              {/* Glow effects */}
              <div className="absolute -left-20 -top-20 w-72 h-72 rounded-full bg-gradient-to-tr from-blue-600/30 to-blue-700/30 blur-3xl animate-pulse" />
              <div className="absolute -right-16 -bottom-16 w-64 h-64 rounded-full bg-gradient-to-br from-slate-600/30 to-slate-700/30 blur-3xl animate-pulse" style={{animationDelay: '1s'}} />

              {/* Main card with glassmorphism */}
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-blue-700 to-slate-700 rounded-3xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
                
                <div className="relative bg-gradient-to-br from-slate-900/90 to-blue-950/90 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/10 group-hover:border-blue-400/20 transition-all duration-500">
                  {/* Shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <div className="relative">
                    <Image
                      src="/gambarawal.svg"
                      alt="Ilustrasi sistem logistik POLDA NTB"
                      width={900}
                      height={580}
                      className="w-full h-auto object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-500"
                      priority
                    />
                  </div>
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
