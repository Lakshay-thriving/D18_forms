import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const defaultAdminEmail = process.env.DEFAULT_ADMIN_EMAIL || 'admin@iitrpr.ac.in'

  // Create default admin user if it doesn't exist
  const existingAdmin = await prisma.user.findUnique({
    where: { email: defaultAdminEmail },
  })

  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        email: defaultAdminEmail,
        role: 'ADMIN',
        isApproved: true,
      },
    })
    console.log(`Created default admin user: ${defaultAdminEmail}`)
  } else {
    console.log(`Admin user already exists: ${defaultAdminEmail}`)
  }

  // Create workflow users for testing
  const workflowUsers = [
    { email: 'registrar@iitrpr.ac.in', role: 'REGISTRAR' as const },
    { email: 'jregistrar@iitrpr.ac.in', role: 'JOINT_REGISTRAR' as const },
    { email: 'establishment1@iitrpr.ac.in', role: 'ESTABLISHMENT_1' as const },
    { email: 'establishment2@iitrpr.ac.in', role: 'ESTABLISHMENT_2' as const },
  ]

  for (const user of workflowUsers) {
    const existing = await prisma.user.findUnique({
      where: { email: user.email },
    })

    if (!existing) {
      await prisma.user.create({
        data: {
          email: user.email,
          role: user.role,
          isApproved: true,
        },
      })
      console.log(`✅ Created ${user.role} user: ${user.email}`)
    } else {
      console.log(`✅ ${user.role} user already exists: ${user.email}`)
    }
  }
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
