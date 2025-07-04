// prisma/seed.ts
import { PrismaClient, Role } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding ...');

  const password = await hash('polda123', 10); // Ganti dengan password yang aman

  const superAdmin = await prisma.user.create({
    data: {
      email: 'superadmin@polda.ntb',
      nama: 'Super Admin Polda NTB',
      password: password,
      role: Role.SUPER_ADMIN,
    },
  });

  console.log({ superAdmin });
  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });