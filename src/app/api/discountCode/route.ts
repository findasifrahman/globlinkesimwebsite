import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const currentDate = new Date();
    
    const discountCodes = await prisma.esimDiscount.findMany({
      where: {
        isActive: true,
        expireDate: {
          gt: currentDate
        }
      },
      select: {
        discountCode: true,
        discountPercentage: true,
        refererName: true
      }
    });

    // Return empty array if no discount codes found
    return NextResponse.json(discountCodes || []);
  } catch (error) {
    console.error('Error fetching discount codes:', error);
    // Return empty array instead of error
    return NextResponse.json([], { status: 200 });
  }
} 