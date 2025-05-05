import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

// Validate DATABASE_URL format
const validateDatabaseUrl = (url: string | undefined) => {
  if (!url) {
    throw new Error('DATABASE_URL is not defined');
  }
  if (!url.startsWith('postgresql://') && !url.startsWith('postgres://')) {
    throw new Error('DATABASE_URL must start with postgresql:// or postgres://');
  }
  return url;
};

// Initialize Prisma Client with error handling
const prisma = globalForPrisma.prisma || new PrismaClient({
  log: ['error', 'warn'],
  datasources: {
    db: {
      url: validateDatabaseUrl(process.env.DATABASE_URL)
    }
  }
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Add connection error handling
prisma.$connect().catch((error) => {
  console.error('Database connection error:', error);
  console.error('DATABASE_URL:', process.env.DATABASE_URL ? '***' : 'undefined');
  process.exit(1);
});

export { prisma }; 