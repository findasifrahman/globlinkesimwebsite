import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.log("inside esimorderbeforepayment-------------------------");
    const body = await req.json();
    const {
      paymentOrderNo,
      packageCode,
      count,
      amount,
      currency,
      discountCode,
      finalAmountPaid,
      isTopUp = false,
      originalOrderNo = null
    } = body;

    if (!paymentOrderNo || !packageCode || !count || !amount || !currency) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create the order before payment
    const order = await prisma.esimOrderBeforePayment.create({
      data: {
        paymentOrderNo: paymentOrderNo,
        orderNo: paymentOrderNo,
        userId: session.user.id,
        packageCode,
        count,
        amount,
        periodNum: 1, // Default period number
        currency,
        status: 'PENDING',
        paymentState: 'pending',
        transactionId: crypto.randomUUID(), // Generate a unique transaction ID
        createdAt: new Date(),
      },
    });

    return NextResponse.json({ order });
  } catch (error) {
    console.error('Error creating order before payment:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve order data
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const orderId = url.searchParams.get('order_id');

    if (!orderId) {
      return NextResponse.json(
        { error: 'Missing order_id parameter' },
        { status: 400 }
      );
    }

    // Find the order before payment
    const order = await prisma.esimOrderBeforePayment.findFirst({
      where: {
        orderNo: orderId,
        userId: session.user.id,
      },
      include: {
        package: true, // Include package details
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error('Error retrieving order:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve order' },
      { status: 500 }
    );
  }
} 