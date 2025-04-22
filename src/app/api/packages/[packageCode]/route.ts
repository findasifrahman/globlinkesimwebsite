import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    const packageDetails = await prisma.allPackage.findFirst({
      where: { packageCode: slug },
    });

    if (!packageDetails) {
      return NextResponse.json({ error: 'Package not found' }, { status: 404 });
    }

    return NextResponse.json({ package: packageDetails });
  } catch (error) {
    console.error('Error fetching package details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch package details' },
      { status: 500 }
    );
  }
} 