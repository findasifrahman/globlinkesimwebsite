import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const discountCodeSchema = z.object({
  refererId: z.string().min(1, 'Referer ID is required'),
  refererName: z.string().min(1, 'Referer Name is required'),
  discountCode: z.string().min(1, 'Discount Code is required'),
  discountPercentage: z.number().min(1).max(100),
  expireDate: z.string().datetime(),
});

export async function GET() {
  try {
    const discountCodes = await prisma.esimDiscount.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
    return NextResponse.json(discountCodes);
  } catch (error) {
    console.error('Error fetching discount codes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch discount codes' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Received request body:', body);

    // Convert discountPercentage to number if it's a string
    if (typeof body.discountPercentage === 'string') {
      body.discountPercentage = parseFloat(body.discountPercentage);
    }

    // Validate the request body
    const validatedData = discountCodeSchema.parse(body);
    console.log('Validated data:', validatedData);

    // Check if discount code already exists
    const existingCode = await prisma.esimDiscount.findUnique({
      where: {
        discountCode: validatedData.discountCode,
      },
    });

    if (existingCode) {
      return NextResponse.json(
        { error: 'Discount code already exists' },
        { status: 400 }
      );
    }

    // Create the discount code
    const discountCode = await prisma.esimDiscount.create({
      data: {
        ...validatedData,
        isActive: true,
      },
    });

    return NextResponse.json(discountCode, { status: 201 });
  } catch (error) {
    console.error('Error creating discount code:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create discount code' },
      { status: 500 }
    );
  }
} 