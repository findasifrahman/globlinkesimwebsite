import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

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
