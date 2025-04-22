import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const regionType = searchParams.get('regionType');
    
    console.log('Fetching packages with regionType:', regionType);
    
    // Build the where clause based on regionType
    const where = regionType === 'multi' 
      ? { multiregion: true }
      : regionType === 'single'
      ? { multiregion: false }
      : {};
    
    console.log('Using where clause:', where);
    
    // Fetch packages from database
    const packages = await prisma.allPackage.findMany({
      where,
      orderBy: {
        packageName: 'asc',
      },
    });
    
    console.log(`Found ${packages.length} packages (${regionType === 'multi' ? 'multi-region' : regionType === 'single' ? 'single-region' : 'all'})`);
    
    return NextResponse.json(packages);
  } catch (error) {
    console.error('Error in /api/packages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch packages' },
      { status: 500 }
    );
  }
} 