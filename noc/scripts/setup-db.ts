/**
 * Database setup script
 * Run with: c
 * Or: node -r esbuild-register scripts/setup-db.ts
 */

import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../lib/auth'

const prisma = new PrismaClient()

async function main() {
  console.log('Setting up database...')

  try {
    // Create default admin user if it doesn't exist
    const defaultAdminEmail = process.env.DEFAULT_ADMIN_EMAIL || 'shivangnag@gmail.com'
    
    const existingAdmin = await prisma.user.findUnique({
      where: { email: defaultAdminEmail },
    })

    if (!existingAdmin) {
      const adminPassword = hashPassword('admin123')
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

    // Create sample roles if needed
    console.log('Database setup completed successfully!')
    console.log('\nNext steps:')
    console.log('1. Set up environment variables in .env.local')
    console.log('2. Run migrations: npx prisma migrate dev')
    console.log('3. Start the application: npm run dev')
  } catch (error) {
    console.error('Error setting up database:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
