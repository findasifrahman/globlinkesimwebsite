const { execSync } = require('child_process');
const { PrismaClient } = require('@prisma/client');

async function setupDatabase() {
  try {
    // Create the database if it doesn't exist
    execSync('psql -U postgres -c "CREATE DATABASE esim_db;"', { stdio: 'ignore' });
    console.log('Database created successfully');
  } catch (error) {
    // Database might already exist, which is fine
    console.log('Database might already exist, continuing...');
  }

  // Run Prisma migrations
  execSync('npx prisma migrate dev --name init', { stdio: 'inherit' });
  console.log('Migrations completed successfully');

  // Generate Prisma Client
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('Prisma Client generated successfully');

  // Seed the database
  execSync('npx prisma db seed', { stdio: 'inherit' });
  console.log('Database seeded successfully');
}

setupDatabase().catch(console.error); 