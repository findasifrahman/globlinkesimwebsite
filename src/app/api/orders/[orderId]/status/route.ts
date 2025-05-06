import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(
  req: Request,
  { params }: { params: { orderId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const orderId = params.orderId;

    // Get order status
    const order = await prisma.esimOrderAfterPayment.findUnique({
      where: { orderNo: orderId },
      include: {
        package: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Get queue status
    const queueItem = await prisma.processingQueue.findFirst({
      where: { orderNo: orderId },
      orderBy: { createdAt: 'desc' },
    });

    // If order is completed, return success
    if (order.status === 'COMPLETED') {
      return NextResponse.json({
        status: 'COMPLETED',
        orderNo: order.orderNo,
        package: order.package,
      });
    }

    // If order failed, return error
    if (order.status === 'FAILED') {
      return NextResponse.json({
        status: 'FAILED',
        error: 'Order processing failed',
      });
    }

    // If queue item exists and is processing
    if (queueItem) {
      return NextResponse.json({
        status: queueItem.status,
        retryCount: queueItem.retryCount,
        error: queueItem.error,
      });
    }

    // Default to processing status
    return NextResponse.json({
      status: 'PROCESSING',
    });
  } catch (error) {
    console.error('Error checking order status:', error);
    return NextResponse.json(
      { error: 'Failed to check order status' },
      { status: 500 }
    );
  }
} 