import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="h-16 flex items-center justify-between px-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div>
        {/* Bisa ditambahkan Breadcrumbs atau Judul Halaman di sini */}
        <h2 className="text-lg font-semibold">Dashboard Admin Satker</h2>
      </div>
      <div>
        <Button variant="outline">Logout</Button>
      </div>
    </header>
  );
}