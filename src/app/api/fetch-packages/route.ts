import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { generateHmacSignature, isMultiRegionPackage } from '@/lib/utils';

const API_URL = 'https://api.esimaccess.com/api/v1/open/package/list';
const ACCESS_CODE = process.env.ESIM_ACCESS_CODE || 'e3ea14e1fe6547a29d3133fd220150b7';
const SECRET_KEY = process.env.ESIM_SECRET_KEY || '651c41ac694a4638902461297b67b156';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    // Generate timestamp for the request
    const timestamp = Math.floor(Date.now() / 1000).toString();
    
    // Create data string for HMAC signature
    const dataString = `${ACCESS_CODE}${timestamp}`;
    
    // Generate HMAC signature
    const signature = generateHmacSignature(dataString, SECRET_KEY);
    
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

    // Transform packages to match our database schema
    const packages = data.obj.packageList.map((pkg: any) => {
      const isMultiRegion = isMultiRegionPackage(pkg.name, pkg.location);
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
        duration: parseInt(pkg.duration || '30'),
        location: pkg.location || '',
        activeType: parseInt(pkg.activeType || '1'),
        retailPrice: parseFloat(pkg.retailPrice || pkg.price),
        speed: pkg.speed || '4G',
        multiregion: isMultiRegion,
        favourite: pkg.favorite === true,
        operators: operators,
      };
    });

    return NextResponse.json({
      success: true,
      message: 'Packages fetched successfully',
      packages
    });
  } catch (error) {
    console.error('Error fetching packages:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch packages', error: String(error) },
      { status: 500 }
    );
  }
} 