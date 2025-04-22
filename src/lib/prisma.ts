import { PrismaClient } from '@prisma/client'

// Properly declare the global variable
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

// Log the database URL (without the password)
const dbUrl = process.env.DATABASE_URL || '';
const maskedUrl = dbUrl.replace(/:([^:@]+)@/, ':****@');
console.log('Connecting to database:', maskedUrl);

const prismaClient = global.prisma || new PrismaClient({
  log: ['query', 'error', 'warn'],
})

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prismaClient
}

export { prismaClient as prisma } 