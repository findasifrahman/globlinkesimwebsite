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
      signature: signature.substring(0, 10) + '...'
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
    
    console.log(`Processing ${data.obj.packageList.length} packages from API`);
    
    // Get all existing package codes from database
    const existingPackages = await prisma.allPackage.findMany({
      select: {
        packageCode: true,
      }
    });
    const existingPackageCodes = new Set(existingPackages.map(p => p.packageCode));
    
    // Process packages from API
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
    
    // Get package codes from API response
    const apiPackageCodes = new Set(packages.map(p => p.packageCode));
    
    // Find packages that exist in DB but not in API
    const packagesToDelete = Array.from(existingPackageCodes).filter(
      code => !apiPackageCodes.has(code)
    );
    
    // Check for packages with orders in a single query
    let packagesWithOrders: { packageCode: string, orderType: string }[] = [];
    if (packagesToDelete.length > 0) {
      try {
        // Use a single query with EXISTS to check for orders and their types
        packagesWithOrders = await prisma.$queryRaw`
          SELECT DISTINCT 
            p."package_code" as "packageCode",
            CASE 
              WHEN EXISTS (SELECT 1 FROM "esim_order_before_payment" o WHERE o."package_code" = p."package_code") THEN 'before_payment'
              WHEN EXISTS (SELECT 1 FROM "esim_order_after_payment" o WHERE o."package_code" = p."package_code") THEN 'after_payment'
              ELSE 'none'
            END as "orderType"
          FROM "all_packages" p
          WHERE p."package_code" = ANY(${packagesToDelete})
          AND (
            EXISTS (
              SELECT 1 FROM "esim_order_before_payment" o 
              WHERE o."package_code" = p."package_code"
            )
            OR
            EXISTS (
              SELECT 1 FROM "esim_order_after_payment" o 
              WHERE o."package_code" = p."package_code"
            )
          )
        `;
      } catch (error) {
        console.error('Error checking packages with orders:', error);
        // If we can't check for orders, assume all packages have orders to be safe
        packagesWithOrders = packagesToDelete.map(code => ({ packageCode: code, orderType: 'unknown' }));
      }
    }
    
    // Create set of packages that can be safely deleted
    const safeToDelete = new Set(
      packagesToDelete.filter(
        code => !packagesWithOrders.some(p => p.packageCode === code)
      )
    );
    
    // Track packages that can't be deleted due to orders
    const packagesWithOrdersInfo = packagesWithOrders.map(p => ({
      packageCode: p.packageCode,
      orderType: p.orderType,
      message: `Cannot delete package ${p.packageCode} as it has associated orders in ${p.orderType} table`
    }));
    
    // Delete packages that no longer exist in API and have no orders
    let deletedCount = 0;
    if (safeToDelete.size > 0) {
      console.log(`Attempting to delete ${safeToDelete.size} packages that no longer exist in API`);
      
      try {
        // Use a single delete query for all safe-to-delete packages
        const result = await prisma.allPackage.deleteMany({
          where: {
            packageCode: {
              in: Array.from(safeToDelete)
            }
          }
        });
        deletedCount = result.count;
        console.log(`Successfully deleted ${deletedCount} packages`);
      } catch (error) {
        console.error('Failed to delete packages:', error);
      }
    }
    
    // Log packages that can't be deleted
    if (packagesWithOrdersInfo.length > 0) {
      console.log('Packages that cannot be deleted due to associated orders:');
      packagesWithOrdersInfo.forEach(info => {
        console.log(`- ${info.packageCode}: ${info.message}`);
      });
    }
    
    // Update or create packages in batches
    let updatedCount = 0;
    let createdCount = 0;
    const batchSize = 100;
    
    for (let i = 0; i < packages.length; i += batchSize) {
      const batch = packages.slice(i, i + batchSize);
      const batchResults = await Promise.allSettled(
        batch.map(async (pkg) => {
          try {
            const existingPackage = await prisma.allPackage.findUnique({
              where: { packageCode: pkg.packageCode }
            });
            
            if (existingPackage) {
              await prisma.allPackage.update({
                where: { packageCode: pkg.packageCode },
                data: pkg
              });
              return { type: 'update' as const, success: true };
            } else {
              await prisma.allPackage.create({
                data: pkg
              });
              return { type: 'create' as const, success: true };
            }
          } catch (error) {
            console.error(`Error processing package ${pkg.packageCode}:`, error);
            return { type: 'error' as const, success: false };
          }
        })
      );
      
      batchResults.forEach(result => {
        if (result.status === 'fulfilled') {
          if (result.value.type === 'update') updatedCount++;
          if (result.value.type === 'create') createdCount++;
        }
      });
      
      console.log(`Processed batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(packages.length/batchSize)}`);
    }
    
    return NextResponse.json({
      success: true,
      message: `Successfully processed packages: ${createdCount} created, ${updatedCount} updated, ${deletedCount} deleted`,
      count: {
        created: createdCount,
        updated: updatedCount,
        deleted: deletedCount
      },
      packagesWithOrders: packagesWithOrdersInfo
    });
  } catch (error) {
    console.error('Error fetching packages:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error', error: String(error) },
      { status: 500 }
    );
  }
} 