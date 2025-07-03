import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // --- SIMULASI VALIDASI KE DATABASE ---
    // Nantinya, bagian ini akan diganti dengan query ke database Prisma
    const superAdmin = {
      email: "superadmin@polda.go.id",
      password: "password123",
      nama: "Super Admin",
      role: "SUPER_ADMIN",
      redirectUrl: "/super-admin/dashboard",
    };

    const adminSatker = {
      email: "admin.satker@polda.go.id",
      password: "password123",
      nama: "Admin Satker 1",
      role: "ADMIN_SATKER",
      redirectUrl: "/admin-satker/dashboard",
    };

    if (email === superAdmin.email && password === superAdmin.password) {
      // Jangan pernah kirim password kembali ke client
      const { password, ...user } = superAdmin;
      return NextResponse.json({ user });
    }

    if (email === adminSatker.email && password === adminSatker.password) {
      const { password, ...user } = adminSatker;
      return NextResponse.json({ user });
    }
    // --- AKHIR SIMULASI ---

    // Jika tidak ada user yang cocok
    return NextResponse.json(
      { error: "Email atau password salah." },
      { status: 401 } // 401 Unauthorized
    );

  } catch (error) {
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}