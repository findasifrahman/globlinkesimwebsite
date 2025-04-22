const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    // Test the connection
    const result = await prisma.$queryRaw`SELECT current_database()`;
    console.log('Connected to database:', result);

    // Try to count users
    const userCount = await prisma.user.count();
    console.log('Number of users:', userCount);

  } catch (error) {
    console.error('Database connection error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 