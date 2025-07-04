import Link from 'next/link';
import Image from 'next/image';

const landingPage = () => {
  return (
  <div className="min-h-screen bg-[#E7EEF3]">
    <div className="container mx-auto px-6 py-16 flex flex-col lg:flex-row items-center justify-between min-h-[calc(100vh-76px)] ">
      <div className="lg:w-1/2 space-y-8 max-w-2xl">
        <h1 className="text-4xl lg:text-6xl font-bold text-[#0B1221] leading-tight">
          Selamat Datang di Sistem Logistik POLDA NTB
        </h1>
        <p className="text-gray-600 text-lg lg:text-xl leading-relaxed">
          Sistem Terintegrasi untuk Manajemen Stok, Peminjaman, dan Laporan Logistik
        </p>
        <div className="flex gap-4 pt-6">
          <Link 
            href="/signUp"
            className="bg-[#0B1221] text-white px-8 py-4 rounded-lg hover:bg-[#1a2942] transition-all transform hover:scale-105 flex items-center gap-2 text-lg"
          >
            <i className="fas fa-user-plus"></i>
            <span>Daftar</span>
          </Link>
          <Link
            href="/login"
            className="border-2 border-[#0B1221] text-[#0B1221] px-8 py-4 rounded-lg hover:bg-[#0B1221] hover:text-white transition-all transform hover:scale-105 flex items-center gap-2 text-lg"
          >
            <i className="fas fa-sign-in-alt"></i>
            <span>Masuk</span>
          </Link>
        </div>
      </div>
      <div className="w-full lg:w-1/2 mt-12 lg:mt-0 flex justify-center">
            <div className="relative w-full max-w-2xl">
              <Image
                src="/gambarawal.svg"
                alt="POLDA NTB Officers"
                width={600}
                height={400}
                className="w-full h-auto rounded-lg shadow-xl"
                priority
              />
            </div>
          </div>
    </div>
</div>
  );
};

export default landingPage;
