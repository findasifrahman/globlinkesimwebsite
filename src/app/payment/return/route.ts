import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Mark this route as dynamic to prevent static generation
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const orderId = url.searchParams.get('order_id');
    const status = url.searchParams.get('status');
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

    if (!orderId) {
      console.log("order id is missing--", orderId);
      return NextResponse.json({ error: 'Missing order_id parameter' }, { status: 400 });
    }
    console.log("order id inside return route is--", orderId);
    // Check payment status in the database
    const paymentState = await prisma.paymentWebhookState.findFirst({
      where: {
        orderId,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    if (!paymentState) {
      console.log("payment state not found", paymentState);
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }
    console.log("payment state is-----", paymentState);

    // If payment is completed, process the order
    if (paymentState.status === 'completed') {
        console.log("payment state is completed found--");
      // Get the session for authorization
      const session = await getServerSession(authOptions);
      if (!session?.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      // Create esim order using the existing /api/orders endpoint
      const orderResponse = await fetch(`${baseUrl}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.user.email}`
        },
        body: JSON.stringify({
          packageCode: paymentState.pmId,
          count: 1,
          price: paymentState.amount.toNumber(),
        }),
      });

      const orderData = await orderResponse.json();

      if (!orderResponse.ok) {
        console.error('Failed to create order:', orderData);
        throw new Error(orderData.error || 'Failed to create order');
      }
      console.log("payement state is completed--", orderData);
      // Redirect to success page using the same base URL
      return NextResponse.redirect(new URL(`/orders/${orderData.order.orderNo}`, baseUrl));
    } else {
      // Redirect to failure page using the same base URL
      console.log("payment state is failed or pending--", orderId);
      return NextResponse.redirect(new URL(`/orders/${orderId}?status=failed`, baseUrl));
    }
  } catch (error) {
    console.error('Error processing payment return:', error);
    return NextResponse.json(
      { error: 'Failed to process payment return' },
      { status: 500 }
    );
  }
} 