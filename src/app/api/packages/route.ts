import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Mark this route as dynamic
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const packages = await prisma.allPackage.findMany({
      where: {
        activeType: 1, // Assuming 1 means active
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(packages);
  } catch (error) {
    console.error('Error fetching packages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch packages' },
      { status: 500 }
    );
  }
} 