const { prisma } = require('@/lib/prisma');
const { generateHmacSignature, isMultiRegionPackage } = require('@/lib/utils');

const API_URL = 'https://api.esimaccess.com/api/v1/open/package/list';
const ACCESS_CODE = process.env.ACCESS_CODE || 'esimaccess';
const SECRET_KEY = process.env.SECRET_KEY || 'esimaccess';

async function fetchAndSavePackages() {
  try {
    const timestamp = new Date().toISOString();
    const data = `accessCode=${ACCESS_CODE}&timestamp=${timestamp}`;
    const signature = generateHmacSignature(data, SECRET_KEY);

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Access-Code': ACCESS_CODE,
        'X-Timestamp': timestamp,
        'X-Signature': signature
      },
      body: JSON.stringify({})
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const result = await response.json();
    
    if (result.code !== 200) {
      throw new Error(`API error: ${result.message}`);
    }

    const packages = result.data.map((pkg: any) => ({
      packageName: pkg.packageName,
      packageCode: pkg.packageCode,
      slug: pkg.packageCode.toLowerCase(),
      price: pkg.price,
      currencyCode: pkg.currencyCode,
      smsStatus: pkg.smsStatus,
      duration: pkg.duration,
      location: pkg.location,
      activeType: pkg.activeType,
      retailPrice: pkg.retailPrice,
      speed: pkg.speed,
      multiregion: isMultiRegionPackage(pkg.packageName, pkg.location)
    }));

    for (const pkg of packages) {
      await prisma.allPackage.upsert({
        where: { packageCode: pkg.packageCode },
        update: pkg,
        create: pkg
      });
    }

    console.log(`Successfully saved ${packages.length} packages`);
  } catch (error) {
    console.error('Error fetching packages:', error);
  }
}

fetchAndSavePackages(); 