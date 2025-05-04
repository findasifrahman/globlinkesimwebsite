// Mark this route as dynamic
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '0');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const showAll = searchParams.get('showAll') === 'true';

    // Calculate date for last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Build where clause
    const where: Prisma.esimOrderAfterPaymentWhereInput = {
      ...(showAll ? {} : {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      }),
      ...(search ? {
        OR: [
          { orderNo: { contains: search, mode: 'insensitive' as const } },
          { paymentOrderNo: { contains: search, mode: 'insensitive' as const } },
          { transactionId: { contains: search, mode: 'insensitive' as const } },
          { user: { email: { contains: search, mode: 'insensitive' as const } } },
          { packageCode: { contains: search, mode: 'insensitive' as const } },
        ],
      } : {}),
    };

    // Get total count for pagination
    const totalCount = await prisma.esimOrderAfterPayment.count({ where });

    // Fetch orders with pagination
    const orders = await prisma.esimOrderAfterPayment.findMany({
      where,
      include: {
        user: {
          select: {
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip: page * limit,
      take: limit,
    });

    return NextResponse.json({
      orders,
      totalCount,
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
} 