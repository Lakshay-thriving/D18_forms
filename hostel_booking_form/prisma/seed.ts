import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'admin@iitrpr.ac.in';
  
  // Check if admin already exists
  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (existing) {
    console.log('✅ Admin account already exists.');
    return;
  }

  const hashedPassword = await bcrypt.hash('admin123', 12);

  await prisma.user.create({
    data: {
      name: 'System Administrator',
      email: adminEmail,
      password: hashedPassword,
      role: 'ADMIN',
      status: 'APPROVED',
      empCode: 'ADMIN-001',
      mobile: '0000000000',
    },
  });

  console.log('✅ Super Admin account created: admin@iitrpr.ac.in / admin123');

  // Log the seed event
  await prisma.systemLog.create({
    data: {
      userEmail: adminEmail,
      action: 'SYSTEM_SEED',
      details: 'Super Admin account created via seed script',
    },
  });
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
