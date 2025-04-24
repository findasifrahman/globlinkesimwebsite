import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Mark this route as dynamic
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    console.log('Fetching packages from database...');
    
    const packages = await prisma.allPackage.findMany({
      where: {
        activeType: 1, // Assuming 1 means active
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log(`Found ${packages.length} packages in database`);

    if (packages.length === 0) {
      console.log('No active packages found in database');
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