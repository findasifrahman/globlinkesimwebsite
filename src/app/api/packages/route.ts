import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { md5sum } from '@/utils/hash';
// Mark this route as dynamic
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  /// test code by asif

  const signature = md5sum(process.env.PAYSSION_API_KEY, "payssion_test", "1.00", "USD", "123456789", process.env.PAYSSION_SECRET_KEY);
  console.log("MD5 Signature RETURN IS  ----:", signature);  
  ///
  try {
    //console.log('Fetching packages from database...');
    
    // First, get the total count of all packages
    const totalCount = await prisma.allPackage.count();
    //console.log(`Total packages in database: ${totalCount}`);
    
    // Then fetch all packages
    const packages = await prisma.allPackage.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    //console.log(`Fetched ${packages.length} packages from database`);
    
    // Log the first few packages to verify the data
    //console.log('Sample packages:', packages.slice(0, 3));
    
    // Log the last few packages to verify we're getting all records
    //console.log('Last packages:', packages.slice(-3));

    if (packages.length === 0) {
      console.log('No packages found in database');
      return NextResponse.json([], { status: 200 });
    }

    return NextResponse.json(packages);
  } catch (error) {
    console.error('Error fetching packages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch packages', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 