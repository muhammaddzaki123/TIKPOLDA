

import { getRiwayatPeminjamanBySatker } from "../peminjaman/actions";
import { RiwayatPeminjamanTable } from "@/components/RiwayatPeminjamanTable";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default async function RiwayatPeminjamanPage() {
    
    // Panggil server action untuk mengambil data riwayat
    const dataRiwayat = await getRiwayatPeminjamanBySatker();

    return (
        <main className="w-full space-y-4 md:space-y-6 p-4 md:p-6">
            <div className="flex items-center">
                <h1 className="text-2xl md:text-3xl font-bold">Riwayat Peminjaman Internal</h1>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl md:text-2xl">Daftar Peminjaman Selesai</CardTitle>
                    <CardDescription>
                        Halaman ini berisi daftar semua transaksi peminjaman HT yang telah selesai (dikembalikan).
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {/* Render komponen tabel dengan data riwayat */}
                    <RiwayatPeminjamanTable data={dataRiwayat} />
                </CardContent>
            </Card>
        </main>
    );
}