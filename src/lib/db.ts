import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Check if DATABASE_URL is properly configured
const isDatabaseConfigured = process.env.DATABASE_URL && 
  !process.env.DATABASE_URL.includes('placeholder') &&
  process.env.DATABASE_URL.startsWith('postgres')

let prisma: PrismaClient | null = null

if (isDatabaseConfigured) {
  prisma = globalForPrisma.prisma ?? new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })
  
  if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
}

export { prisma }

// Export as db for convenience
export const db = prisma

export default prisma

// Helper to check if database is available
export function isDatabaseAvailable(): boolean {
  return prisma !== null
}
