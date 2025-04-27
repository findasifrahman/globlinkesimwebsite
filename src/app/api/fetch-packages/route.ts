import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { generateHmacSignature, isMultiRegionPackage } from '@/lib/utils';

const API_URL = 'https://api.esimaccess.com/api/v1/open/package/list';
const ACCESS_CODE = process.env.ESIM_ACCESS_CODE || 'e3ea14e1fe6547a29d3133fd220150b7';
const SECRET_KEY = process.env.ESIM_SECRET_KEY || '651c41ac694a4638902461297b67b156';

export async function POST() {
  try {


    // Generate timestamp for the request
    const timestamp = Math.floor(Date.now() / 1000).toString();
    
    // Create data string for HMAC signature
    const dataString = `${ACCESS_CODE}${timestamp}`;
    
    // Generate HMAC signature
    const signature = generateHmacSignature(dataString, SECRET_KEY);
    
    console.log('Making API request with:', {
      url: API_URL,
      accessCode: ACCESS_CODE,
      timestamp,
      signature: signature.substring(0, 10) + '...' // Log partial signature for security
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
    
    console.log('API response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        errorData = { message: errorText };
      }
      
      return NextResponse.json(
        { success: false, message: 'Failed to fetch packages from API', error: errorData },
        { status: response.status }
      );
    }
    
    const responseText = await response.text();
    console.log('API Response text:', responseText.substring(0, 200) + '...'); // Log first 200 chars
    
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error('Failed to parse API response as JSON:', e);
      return NextResponse.json(
        { success: false, message: 'Invalid JSON response from API' },
        { status: 400 }
      );
    }
    
    if (!data.success || !data.obj || !data.obj.packageList || !Array.isArray(data.obj.packageList)) {
      console.error('Invalid response format:', data);
      return NextResponse.json(
        { success: false, message: 'Invalid response format from API', data },
        { status: 400 }
      );
    }
    
    console.log(`Processing ${data.obj.packageList.length} packages from API`);
    
    // Process packages from API
    const packages = data.obj.packageList.map((pkg: any) => {
      // Determine if package is multi-region based on name and location
      const isMultiRegion = isMultiRegionPackage(pkg.name, pkg.location);
      
      // Extract operators from locationNetworkList
      const operators = pkg.locationNetworkList 
        ? pkg.locationNetworkList
            .flatMap((location: any) => 
              location.operatorList 
                ? location.operatorList.map((op: any) => op.operatorName)
                : []
            )
            .join(', ')
        : '';
      
      return {
        packageName: pkg.name,
        packageCode: pkg.packageCode,
        slug: pkg.slug,
        price: parseFloat(pkg.price),
        currencyCode: pkg.currencyCode,
        smsStatus: pkg.smsStatus === '1',
        duration: parseInt(pkg.duration || '30'), // Default to 30 days if not specified
        location: pkg.location || '',
        activeType: parseInt(pkg.activeType || '1'), // Default to 1 if not specified
        retailPrice: parseFloat(pkg.retailPrice || pkg.price), // Use price as retail price if not specified
        speed: pkg.speed || '4G', // Default to 4G if not specified
        multiregion: isMultiRegion,
        favourite: pkg.favorite === true,
        operators: operators,
      };
    });
    
    // Delete all existing packages
    console.log('Deleting all existing packages...');
    await prisma.allPackage.deleteMany({});
    console.log('All existing packages deleted');
    
    // Insert new packages
    console.log(`Inserting ${packages.length} new packages...`);
    let insertedCount = 0;
    
    for (const pkg of packages) {
      try {
        await prisma.allPackage.create({
          data: pkg,
        });
        insertedCount++;
      } catch (dbError) {
        console.error(`Error inserting package ${pkg.packageCode}:`, dbError);
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `Successfully fetched and saved ${insertedCount} packages`,
      count: insertedCount,
    });
  } catch (error) {
    console.error('Error fetching packages:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error', error: String(error) },
      { status: 500 }
    );
  }
} 