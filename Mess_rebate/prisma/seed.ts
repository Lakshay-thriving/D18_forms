import { PrismaClient, UserRole, Course } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create hostels
  const hostels = [
    'Chenab Hostel',
    'Beas Hostel',
    'Satluj Hostel',
    'Ravi Hostel',
    'Jhelum Hostel',
  ]

  for (const name of hostels) {
    await prisma.hostel.upsert({
      where: { name },
      update: {},
      create: { name },
    })
  }

  // Create messes
  const messes = ['Main Mess', 'North Mess', 'South Mess']

  for (const name of messes) {
    await prisma.mess.upsert({
      where: { name },
      update: {},
      create: { name },
    })
  }

  // Create demo users
  const hashedPassword = await bcrypt.hash('password123', 10)

  // Admin user
  await prisma.user.upsert({
    where: { email: 'admin@iitrpr.ac.in' },
    update: {},
    create: {
      email: 'admin@iitrpr.ac.in',
      password: hashedPassword,
      name: 'System Admin',
      role: UserRole.ADMIN,
    },
  })

  // Mess Manager
  await prisma.user.upsert({
    where: { email: 'messmanager@iitrpr.ac.in' },
    update: {},
    create: {
      email: 'messmanager@iitrpr.ac.in',
      password: hashedPassword,
      name: 'Mess Manager',
      role: UserRole.MESS_MANAGER,
    },
  })

  // Caretaker
  await prisma.user.upsert({
    where: { email: 'caretaker@iitrpr.ac.in' },
    update: {},
    create: {
      email: 'caretaker@iitrpr.ac.in',
      password: hashedPassword,
      name: 'Hostel Caretaker',
      role: UserRole.CARETAKER,
    },
  })

  // Junior Superintendent
  await prisma.user.upsert({
    where: { email: 'js@iitrpr.ac.in' },
    update: {},
    create: {
      email: 'js@iitrpr.ac.in',
      password: hashedPassword,
      name: 'Junior Superintendent',
      role: UserRole.JUNIOR_SUPERINTENDENT,
    },
  })

  // Demo Student
  await prisma.user.upsert({
    where: { email: 'student@iitrpr.ac.in' },
    update: {},
    create: {
      email: 'student@iitrpr.ac.in',
      password: hashedPassword,
      name: 'Demo Student',
      role: UserRole.STUDENT,
      entryNumber: '2021CSB1001',
      course: Course.UG,
      hostelName: 'Chenab Hostel',
      roomNumber: 'A-101',
      messName: 'Main Mess',
    },
  })

  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
