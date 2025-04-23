import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { pollForOrderStatus, processOrderAfterGotResource } from '@/lib/esim';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * POST /api/esim/poll
 * Polls for order status updates and processes orders when they reach GOT_RESOURCE status
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { orderNo, maxAttempts, intervalMs } = body;

    if (!orderNo) {
      return NextResponse.json({ error: 'Order number is required' }, { status: 400 });
    }

    console.log(`[POST /api/esim/poll] Polling for order status: ${orderNo}`);

    // Check if the order exists and belongs to the user
    const order = await prisma.order.findUnique({
      where: { orderNo },
      include: { user: true }
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Poll for order status
    const gotResource = await pollForOrderStatus(
      orderNo,
      maxAttempts || 30,
      intervalMs || 2000
    );

    if (!gotResource) {
      return NextResponse.json({ 
        status: 'pending',
        message: 'Order status not yet GOT_RESOURCE'
      });
    }

    // Process the order after confirming GOT_RESOURCE status
    const result = await processOrderAfterGotResource(orderNo);

    // Update the order in the database with the eSIM profile details
    const updatedOrder = await prisma.order.update({
      where: { orderNo },
      data: {
        status: 'GOT_RESOURCE',
        qrCode: result.esimProfile.qrCode,
        iccid: result.esimProfile.iccid,
        eid: result.esimProfile.eid,
        smdpStatus: result.esimProfile.smdpStatus,
        esimStatus: result.esimProfile.esimStatus,
        dataRemaining: result.esimProfile.dataRemaining,
        dataUsed: result.esimProfile.dataUsed,
        expiryDate: result.esimProfile.expiryDate ? new Date(result.esimProfile.expiryDate) : null,
        daysRemaining: result.esimProfile.daysRemaining,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      status: 'success',
      message: 'Order processed successfully',
      order: updatedOrder
    });
  } catch (error) {
    console.error('[POST /api/esim/poll] Error:', error);
    return NextResponse.json(
      { error: 'Failed to process order', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 