

import { getRiwayatPeminjamanBySatker } from "../peminjaman/actions";
import { RiwayatPeminjamanTable } from "@/components/RiwayatPeminjamanTable";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default async function RiwayatPeminjamanPage() {
    
    // Panggil server action untuk mengambil data riwayat
    const dataRiwayat = await getRiwayatPeminjamanBySatker();

    return (
        <main className="p-4 sm:p-6 md:p-8 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Riwayat Peminjaman Internal</h1>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Daftar Peminjaman Selesai</CardTitle>
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