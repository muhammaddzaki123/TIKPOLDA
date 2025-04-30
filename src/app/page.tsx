import Navbar from '@/components/NavbarLan';
import Hero from '@/components/ladingPage';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-gray-100">
      <Navbar />
      <main className="flex-grow">
        <Hero />
      </main>
    </div>
  );
}
