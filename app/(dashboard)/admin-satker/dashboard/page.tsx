import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HandMetal, Wifi, Wrench } from "lucide-react";

export default function AdminSatkerDashboard() {
  return (
    <div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total HT di Satker
              </CardTitle>
              <HandMetal className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">15</div>
              <p className="text-xs text-muted-foreground">
                Unit terdaftar
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                HT Tersedia
              </CardTitle>
              <Wifi className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">
                Siap digunakan
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                HT Rusak / Perbaikan
              </CardTitle>
              <Wrench className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
               <p className="text-xs text-muted-foreground">
                Memerlukan tindakan
              </p>
            </CardContent>
          </Card>
      </div>

      <div className="mt-6">
          {/* Di sini nanti bisa ditambahkan tabel atau chart */}
          <Card>
              <CardHeader>
                  <CardTitle>Aktivitas Terbaru</CardTitle>
              </CardHeader>
              <CardContent>
                  <p>Belum ada aktivitas.</p>
              </CardContent>
          </Card>
      </div>
  </div>
  );
}