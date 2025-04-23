// This script fetches packages from the eSIM API and saves them to the database
const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

const API_URL = 'https://api.esimaccess.com/api/v1/open/package/list';
const ACCESS_CODE = process.env.ESIM_ACCESS_CODE || 'e3ea14e1fe6547a29d3133fd220150b7';
const SECRET_KEY = process.env.ESIM_SECRET_KEY || '651c41ac694a4638902461297b67b156';

// Function to generate HMAC signature
function generateHmacSignature(data, secretKey) {
  return crypto
    .createHmac('sha256', secretKey)
    .update(data)
    .digest('hex');
}

// Function to determine if a package is multiregion
function isMultiRegionPackage(packageName, location) {
  // If location is not a 2-character ISO code, it's multiregion
  if (location.length !== 2) {
    return true;
  }
  
  // If package name doesn't contain the country name, it's multiregion
  const countryName = getCountryNameFromCode(location);
  if (countryName && !packageName.toLowerCase().includes(countryName.toLowerCase())) {
    return true;
  }
  
  return false;
}

// Function to get country name from ISO code
function getCountryNameFromCode(code) {
  const countryMap = {
    'US': 'United States',
    'UK': 'United Kingdom',
    'EU': 'Europe',
    'HK': 'Hong Kong',
    'MO': 'Macau',
    'JP': 'Japan',
    'KR': 'South Korea',
    'CN': 'China',
    'AU': 'Australia',
    'CA': 'Canada',
    // Add more countries as needed
  };
  
  return countryMap[code.toUpperCase()] || null;
}

async function fetchPackages() {
  try {
    console.log('Fetching packages from API...');
    
    // Generate timestamp for the request
    const timestamp = Math.floor(Date.now() / 1000).toString();
    
    // Create data string for HMAC signature
    const dataString = `${ACCESS_CODE}${timestamp}`;
    
    // Generate HMAC signature
    const signature = generateHmacSignature(dataString, SECRET_KEY);
    
    console.log('Making API request with:', {
      url: API_URL,
      headers: {
        'RT-AccessCode': ACCESS_CODE,
        'RT-Timestamp': timestamp,
        'RT-Signature': signature,
      }
    });
    
    // Make request to eSIM API
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'RT-AccessCode': ACCESS_CODE,
        'RT-Timestamp': timestamp,
        'RT-Signature': signature,
      },
      body: JSON.stringify({}),
    });
    
    if (!response.ok) {
      const errorData = await response.text();
      console.error('API Error Response:', {
        status: response.status,
        statusText: response.statusText,
        body: errorData,
      });
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('API Response:', JSON.stringify(data, null, 2));
    
    if (!data.success) {
      throw new Error(data.errorMsg || 'Failed to fetch packages');
    }
    
    if (!data.obj?.packageList) {
      throw new Error('Invalid API response format: missing packageList');
    }
    
    console.log(`Found ${data.obj.packageList.length} packages from API`);
    
    // Process and save packages to database
    const packages = data.obj.packageList.map(pkg => {
      const isMultiRegion = isMultiRegionPackage(pkg.name, pkg.location);
      
      return {
        packageName: pkg.name,
        packageCode: pkg.packageCode,
        slug: pkg.packageCode, // Using packageCode as slug
        price: parseFloat(pkg.price) / 100, // Convert from cents to dollars
        currencyCode: pkg.currencyCode,
        smsStatus: pkg.smsStatus === 1,
        duration: pkg.duration,
        location: pkg.location,
        activeType: pkg.activeType,
        retailPrice: parseFloat(pkg.retailPrice) / 100, // Convert from cents to dollars
        speed: pkg.speed,
        multiregion: isMultiRegion,
      };
    });
    
    console.log('Saving packages to database...');
    
    // Upsert packages to database
    for (const pkg of packages) {
      await prisma.allPackage.upsert({
        where: { packageCode: pkg.packageCode },
        update: pkg,
        create: pkg,
      });
    }
    
    console.log(`Successfully saved ${packages.length} packages to database`);
    
    // Restart Prisma Studio to fix the connection issue
    console.log('To fix the Prisma Studio connection issue, please restart it with:');
    console.log('npx prisma studio');
    
  } catch (error) {
    console.error('Error fetching packages:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the function
fetchPackages(); 