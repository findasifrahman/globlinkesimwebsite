import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sendPaymentConfirmationEmail } from '@/lib/email';
// Mark this route as dynamic to prevent static generation
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const paymentOrderNo = url.searchParams.get('order_id');
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

    if (!paymentOrderNo) {
      return NextResponse.json({ error: 'Missing order_id parameter' }, { status: 400 });
    }
    
    // Check payment status in the database webhook
    const paymentState = await prisma.paymentWebhookState.findFirst({
      where: {
        orderId: paymentOrderNo,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    if (!paymentState) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    // Get the session for authorization
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // If payment is completed, update order status and redirect
    if (paymentState.status === 'completed') {
      console.log("Payment is completed, updating order status....");
      // Update the esimOrderBeforePayment with payment details
      const updatedOrderBeforePayment = await prisma.esimOrderBeforePayment.update({
        where: {
          paymentOrderNo: paymentOrderNo,
        },
        data: {
          transactionId: paymentState.transactionId || '',
          paymentState: 'completed',
          currency: paymentState.currency || 'USD',
          updatedAt: new Date(),
        },
      });

      if (!updatedOrderBeforePayment) {
        return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
      }

      // Create the esimOrderAfterPayment record
      const orderAfterPayment = await prisma.esimOrderAfterPayment.create({
        data: {
          paymentOrderNo: paymentOrderNo,
          orderNo: "PROCESSING-" + paymentOrderNo,
          userId: session.user.id,
          packageCode: updatedOrderBeforePayment.packageCode,
          status: 'PENDING',
          paymentState: 'completed',
          finalAmountPaid: Number(paymentState.amount),
          paidAmount: paymentState.amount,
          transactionId: paymentState.transactionId || '',
          currency: paymentState.currency || 'USD',
          pmId: paymentState.pmId || '',
          pmName: 'alipay_cn',
          discountCode: updatedOrderBeforePayment.discountCode,
        },
      });

      if (!orderAfterPayment) {
        return NextResponse.json({ error: 'Failed to create order after payment' }, { status: 500 });
      }

      // Send email to user with order details
      await sendPaymentConfirmationEmail(session.user.email, paymentOrderNo);

      console.log("Order after payment created, redirecting to payment success page....");
      // Redirect to payment success page
      return NextResponse.redirect(new URL(`/payment-success/${paymentOrderNo}`, baseUrl));
    } else {
      // If payment failed or is pending, redirect to orders page with error status
      console.log("Payment failed or pending, redirecting to orders page with error status");
      return NextResponse.redirect(new URL(`/orders/${paymentOrderNo}?status=failed`, baseUrl));
    }
  } catch (error) {
    console.error('Error processing payment return:', error);
    return NextResponse.json(
      { error: 'Failed to process payment return' },
      { status: 500 }
    );
  }
}

