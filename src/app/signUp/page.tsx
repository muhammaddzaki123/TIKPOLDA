import Link from 'next/link';
import Image from 'next/image';

export default function SignUp() {
  return (
    <div className="min-h-screen flex bg-[#F8FAFC]">
      {/* Left side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 ">
        <div className="w-full max-w-md bg-[#E7EEF3] rounded-3xl p-8 shadow-xl">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-[#0B1221] mb-2">Selamat Datang!</h1>
            <p className="text-gray-600">Buat Akun Anda</p>
          </div>

          <form className="space-y-8">
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-[#0B1221]">Data Diri</h2>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <div className="relative">
                  <i className="fas fa-envelope absolute left-0 top-1/2 -translate-y-1/2 text-gray-400"></i>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    autoComplete="email"
                    className="w-full pl-6 pr-4 py-3 border-b border-gray-300 bg-transparent focus:outline-none focus:border-[#0B1221]"
                    placeholder="Masukkan email"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="satuan_kerja" className="block text-sm font-medium text-gray-700 mb-1">
                  Satuan Kerja
                </label>
                <div className="relative">
                  <i className="fas fa-building absolute left-0 top-1/2 -translate-y-1/2 text-gray-400"></i>
                  <input
                    type="text"
                    id="satuan_kerja"
                    name="satuan_kerja"
                    className="w-full pl-6 pr-4 py-3 border-b border-gray-300 bg-transparent focus:outline-none focus:border-[#0B1221]"
                    placeholder="Masukkan satuan kerja"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="divisi" className="block text-sm font-medium text-gray-700 mb-1">
                  Divisi
                </label>
                <div className="relative">
                  <i className="fas fa-users absolute left-0 top-1/2 -translate-y-1/2 text-gray-400"></i>
                  <input
                    type="text"
                    id="divisi"
                    name="divisi"
                    className="w-full pl-6 pr-4 py-3 border-b border-gray-300 bg-transparent focus:outline-none focus:border-[#0B1221]"
                    placeholder="Masukkan divisi"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-[#0B1221]">Buat Akun Anda</h2>
              
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <div className="relative">
                  <i className="fas fa-user absolute left-0 top-1/2 -translate-y-1/2 text-gray-400"></i>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    autoComplete="username"
                    className="w-full pl-6 pr-4 py-3 border-b border-gray-300 bg-transparent focus:outline-none focus:border-[#0B1221]"
                    placeholder="Masukkan username"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <i className="fas fa-lock absolute left-0 top-1/2 -translate-y-1/2 text-gray-400"></i>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    autoComplete="new-password"
                    className="w-full pl-6 pr-4 py-3 border-b border-gray-300 bg-transparent focus:outline-none focus:border-[#0B1221]"
                    placeholder="Masukkan password"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#0B1221] text-white py-4 rounded-lg hover:bg-[#1a2942] transition-colors font-medium mt-8"
            >
              Buat Akun
            </button>
          </form>

          <p className="text-center mt-6 text-sm text-gray-600">
            Sudah memiliki akun?{' '}
            <Link href="/signin" className="text-[#0B1221] font-medium hover:underline">
              Masuk
            </Link>
          </p>
        </div>
      </div>
      
      {/* Right side - Brand */}
      <div className="hidden lg:flex w-1/2 bg-[#08232E] items-center justify-center p-12 rounded-tl-3xl rounded-bl-3xl">
        <div className="text-center space-y-6">
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
  );
}
