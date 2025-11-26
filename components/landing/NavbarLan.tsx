import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const Navbar: React.FC = () => {
  return (
    <nav className="bg-white/80 backdrop-blur-lg border-b border-slate-200/50 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-16">
        <div className="flex justify-between items-center h-16 sm:h-18 md:h-20 lg:h-24">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 sm:gap-3 md:gap-4 group">
            <Image
              src="/icon.svg"
              alt="Logo POLDA NTB"
              width={50}
              height={50}
              className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 transition-transform group-hover:scale-110"
            />
            <div className="flex flex-col">
              <span className="text-slate-900 font-bold text-sm sm:text-base md:text-lg lg:text-2xl leading-tight group-hover:text-cyan-600 transition-colors">
                Sistem Logistik
              </span>
              <span className="text-slate-500 text-[10px] sm:text-xs md:text-sm lg:text-base font-medium">POLDA NTB</span>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
            <Link 
              href="/login" 
              className="inline-flex items-center gap-1 sm:gap-2 text-slate-700 hover:text-cyan-600 px-2 sm:px-3 md:px-5 lg:px-6 py-1.5 sm:py-2 md:py-2.5 lg:py-3 rounded-lg sm:rounded-xl hover:bg-cyan-50 transition-all text-xs sm:text-sm md:text-base lg:text-lg font-medium"
            >
              <svg width="14" height="14" className="sm:w-4 sm:h-4 md:w-[18px] md:h-[18px]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M10 17l5-5-5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M15 12H3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="hidden sm:inline">Masuk</span>
            </Link>
            
            <Link 
              href="/register" 
              className="inline-flex items-center gap-1 sm:gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-2 sm:px-3 md:px-5 lg:px-6 py-1.5 sm:py-2 md:py-2.5 lg:py-3 rounded-lg sm:rounded-xl hover:from-cyan-600 hover:to-blue-700 transition-all text-xs sm:text-sm md:text-base lg:text-lg font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transform"
            >
              <svg width="14" height="14" className="sm:w-4 sm:h-4 md:w-[18px] md:h-[18px]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <path d="M15 14a4 4 0 10-6 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M12 7v.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="hidden sm:inline">Daftar</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
