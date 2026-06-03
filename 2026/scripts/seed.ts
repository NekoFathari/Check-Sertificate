// Run with: npm run seed
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seed() {
  console.log('Seeding database...');

  const adminEmail = 'admin@gmail.com';

  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (existing) {
    console.log(`Admin user already exists (${adminEmail}), skipping.`);
  } else {
    await prisma.user.create({
      data: {
        name: 'Admin',
        email: adminEmail,
        password: 'admin',
        role: 'admin',
        theme: 'system',
        emailNotifications: true,
        uploadNotifications: true,
        syncNotifications: true,
      },
    });
    console.log(`Admin user created: ${adminEmail} / admin`);
  }

  console.log('Seeding complete.');
  await prisma.$disconnect();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
