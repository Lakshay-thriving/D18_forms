import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

// Cache the client globally in all environments to avoid exhausting
// the connection pool on Vercel serverless (one instance per cold start).
if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = prisma;
}
