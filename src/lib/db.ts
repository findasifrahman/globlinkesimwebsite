import { PrismaClient } from '@prisma/client'

// Use an explicit connection string instead of relying on environment variables
const DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/esim_db?schema=public";

console.log('Connecting to database:', DATABASE_URL.replace(/:([^:@]+)@/, ':****@'));

// Create a new Prisma client with logging
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: DATABASE_URL
    }
  },
  log: ['query', 'error', 'warn'],
})

export { prisma } 