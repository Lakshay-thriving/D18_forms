import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("Seeding database...")

  // Create Applicants
  await prisma.user.upsert({
    where: { email: "applicant1@example.com" },
    update: {},
    create: {
      email: "applicant1@example.com",
      name: "John Doe",
      role: "APPLICANT",
    },
  })

  await prisma.user.upsert({
    where: { email: "applicant2@example.com" },
    update: {},
    create: {
      email: "applicant2@example.com",
      name: "Jane Smith",
      role: "APPLICANT",
    },
  })

  // Create Faculty Mentors
  await prisma.user.upsert({
    where: { email: "2023csb1167+1@iitrpr.ac.in" },
    update: {},
    create: {
      email: "2023csb1167+1@iitrpr.ac.in",
      name: "Dr. Rajesh Kumar",
      role: "FACULTY_MENTOR",
      department: "COMPUTER_SCIENCE",
    },
  })

  await prisma.user.upsert({
    where: { email: "2023csb1167+2@iitrpr.ac.in" },
    update: {},
    create: {
      email: "2023csb1167+2@iitrpr.ac.in",
      name: "Dr. Priya Sharma",
      role: "FACULTY_MENTOR",
      department: "ELECTRICAL_ENGINEERING",
    },
  })

  await prisma.user.upsert({
    where: { email: "2023csb1167+8@iitrpr.ac.in" },
    update: {},
    create: {
      email: "2023csb1167+8@iitrpr.ac.in",
      name: "Dr. Rajesh Singh",
      role: "FACULTY_MENTOR",
      department: "MECHANICAL_ENGINEERING",
    },
  })

  await prisma.user.upsert({
    where: { email: "2023csb1167+9@iitrpr.ac.in" },
    update: {},
    create: {
      email: "2023csb1167+9@iitrpr.ac.in",
      name: "Dr. Neha Gupta",
      role: "FACULTY_MENTOR",
      department: "CIVIL_ENGINEERING",
    },
  })

  await prisma.user.upsert({
    where: { email: "2023csb1167+10@iitrpr.ac.in" },
    update: {},
    create: {
      email: "2023csb1167+10@iitrpr.ac.in",
      name: "Dr. Sunil Verma",
      role: "FACULTY_MENTOR",
      department: "PHYSICS",
    },
  })

  // Create HODs (one per department)
  await prisma.user.upsert({
    where: { email: "2023csb1167+3@iitrpr.ac.in" },
    update: {},
    create: {
      email: "2023csb1167+3@iitrpr.ac.in",
      name: "Prof. Sanjay Gupta",
      role: "HOD",
      department: "COMPUTER_SCIENCE",
    },
  })

  await prisma.user.upsert({
    where: { email: "2023csb1167+4@iitrpr.ac.in" },
    update: {},
    create: {
      email: "2023csb1167+4@iitrpr.ac.in",
      name: "Prof. Meera Patel",
      role: "HOD",
      department: "ELECTRICAL_ENGINEERING",
    },
  })

  await prisma.user.upsert({
    where: { email: "2023csb1167+11@iitrpr.ac.in" },
    update: {},
    create: {
      email: "2023csb1167+11@iitrpr.ac.in",
      name: "Prof. Vikram Rao",
      role: "HOD",
      department: "MECHANICAL_ENGINEERING",
    },
  })

  await prisma.user.upsert({
    where: { email: "2023csb1167+12@iitrpr.ac.in" },
    update: {},
    create: {
      email: "2023csb1167+12@iitrpr.ac.in",
      name: "Prof. Anita Sharma",
      role: "HOD",
      department: "CIVIL_ENGINEERING",
    },
  })

  await prisma.user.upsert({
    where: { email: "2023csb1167+13@iitrpr.ac.in" },
    update: {},
    create: {
      email: "2023csb1167+13@iitrpr.ac.in",
      name: "Prof. Ramesh Kumar",
      role: "HOD",
      department: "PHYSICS",
    },
  })

  // Create Junior Superintendent
  await prisma.user.upsert({
    where: { email: "2023csb1167+5@iitrpr.ac.in" },
    update: {},
    create: {
      email: "2023csb1167+5@iitrpr.ac.in",
      name: "Mr. Rakesh Gupta",
      role: "JUNIOR_SUPERINTENDENT",
    },
  })

  // Create Assistant Registrar
  await prisma.user.upsert({
    where: { email: "2023csb1167+6@iitrpr.ac.in" },
    update: {},
    create: {
      email: "2023csb1167+6@iitrpr.ac.in",
      name: "Mrs. Meena Kapoor",
      role: "ASSISTANT_REGISTRAR",
    },
  })

  // Create Chief Warden
  await prisma.user.upsert({
    where: { email: "2023csb1167+7@iitrpr.ac.in" },
    update: {},
    create: {
      email: "2023csb1167+7@iitrpr.ac.in",
      name: "Prof. Vikram Patel",
      role: "CHIEF_WARDEN",
    },
  })

  console.log("Database seeded successfully!")
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
