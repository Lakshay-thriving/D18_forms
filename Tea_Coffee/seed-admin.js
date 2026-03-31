const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function seedAdmin() {
  try {
    const admin = await prisma.user.upsert({
      where: { email: "2023csb1167@iitrpr.ac.in" },
      update: {},
      create: {
        id: "admin-initial-001",
        email: "2023csb1167@iitrpr.ac.in",
        name: "System Admin",
        role: "ADMIN",
      },
    });
    console.log("Admin user created:", admin);
  } catch (error) {
    console.error("Error creating admin:", error);
  } finally {
    await prisma.$disconnect();
  }
}

seedAdmin();
