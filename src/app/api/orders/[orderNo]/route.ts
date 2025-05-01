import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { orderNo: string } }
) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Extract orderNo from the URL path
    const orderNo = params.orderNo;
    console.log("Fetching order details for:", orderNo);
    
    if (!orderNo) {
      return NextResponse.json({ error: 'Order number is required' }, { status: 400 });
    }

    // Fetch the order
    const order = await prisma.esimOrderAfterPayment.findFirst({
      where: {
        orderNo,
        userId: session.user.id,
      },
      include: {
        package: true,
        esimProfile: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Return success response with order details
    return NextResponse.json({ order });
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
} 