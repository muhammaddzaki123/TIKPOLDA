import Link from 'next/link';
import Image from 'next/image';

const Navbar = () => {
  return (
    <nav className="bg-[#0B1221] px-6 py-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="flex items-center gap-3 group">
        <Image
              src="/icon.svg"
              alt="Logo POLDA NTB"
              width={50}
              height={50}
              className="w-auto h-auto"
            />
          <span className="text-white font-bold text-xl hidden sm:inline group-hover:text-gray-300 transition-colors">POLDA NTB</span>
        </Link>
        <div className="flex gap-6">
          <Link 
            href="/register" 
            className="text-white hover:text-gray-300 transition-colors flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#1a2942]"
          >
            <i className="fas fa-info-circle"></i>
            <span className="hidden sm:inline">Tentang Kami</span>
          </Link>
          <Link 
            href="/login" 
            className="text-white hover:text-gray-300 transition-colors flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#1a2942]"
          >
            <i className="fas fa-sign-in-alt"></i>
            <span className="hidden sm:inline">Masuk</span>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
