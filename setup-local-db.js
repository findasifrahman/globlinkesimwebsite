const { execSync } = require('child_process');
const { PrismaClient } = require('@prisma/client');

async function setupLocalDatabase() {
  try {
    console.log('Setting up local database for development...');
    
    // Run Prisma migrations
    console.log('Running Prisma migrations...');
    execSync('npx prisma migrate dev --name init', { stdio: 'inherit' });
    console.log('Migrations completed successfully');
    
    // Generate Prisma Client
    console.log('Generating Prisma Client...');
    execSync('npx prisma generate', { stdio: 'inherit' });
    console.log('Prisma Client generated successfully');
    
    // Create a temporary seed file that doesn't use TypeScript
    console.log('Creating temporary seed file...');
    const fs = require('fs');
    const tempSeedPath = 'prisma/temp-seed.js';
    
    const seedContent = `
const { PrismaClient } = require('@prisma/client');
const { hash } = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const password = await hash('password123', 12);
  
  const user = await prisma.user.upsert({
    where: { username: 'testuser' },
    update: {},
    create: {
      name: 'Test User',
      username: 'testuser',
      email: 'testuser@example.com',
      password,
      country: 'US',
      address: '123 Test St',
      registeredAt: new Date(),
    },
  });

  console.log({ user });

  // Create initial packages
  const packages = [
    {
      packageName: 'EU Data Package',
      packageCode: 'EU-42_5_30',
      slug: 'EU-42_5_30',
      price: 42.5,
      currencyCode: 'USD',
      smsStatus: true,
      duration: 30,
      location: 'EU',
      activeType: 1,
      retailPrice: 50.0,
      speed: '5G',
      multiregion: true,
    },
    {
      packageName: 'Hong Kong Data Package',
      packageCode: 'HK_5_30',
      slug: 'HK_5_30',
      price: 15.0,
      currencyCode: 'USD',
      smsStatus: true,
      duration: 30,
      location: 'HK',
      activeType: 1,
      retailPrice: 20.0,
      speed: '4G',
      multiregion: false,
    },
    {
      packageName: 'Macau Data Package',
      packageCode: 'MO_3_30',
      slug: 'MO_3_30',
      price: 10.0,
      currencyCode: 'USD',
      smsStatus: true,
      duration: 30,
      location: 'MO',
      activeType: 1,
      retailPrice: 15.0,
      speed: '4G',
      multiregion: false,
    },
  ];

  // First, delete all existing packages to avoid unique constraint conflicts
  await prisma.allPackage.deleteMany({});

  // Then create new packages
  for (const pkg of packages) {
    await prisma.allPackage.create({
      data: pkg,
    });
  }

  console.log('Database has been seeded. 🌱');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
    `;
    
    fs.writeFileSync(tempSeedPath, seedContent);
    
    // Run the temporary seed file
    console.log('Seeding the database...');
    execSync(`node ${tempSeedPath}`, { stdio: 'inherit' });
    console.log('Database seeded successfully');
    
    // Clean up the temporary seed file
    fs.unlinkSync(tempSeedPath);
    
    console.log('Local database setup completed successfully!');
  } catch (error) {
    console.error('Error setting up local database:', error);
    process.exit(1);
  }
}

setupLocalDatabase().catch(console.error); 