import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sendCreateEsimFailedEmail,sendPaymentConfirmationEmail } from '@/lib/email';


//import {  p } from '@/app/api/esim/poll-status/route';
// Mark this route as dynamic to prevent static generation
export const dynamic = 'force-dynamic';





export async function GET(req: Request) {
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 1000; // 1 second
  let retryCount = 0;

  while (retryCount < MAX_RETRIES) {
    try {
      const url = new URL(req.url);
      const orderId = url.searchParams.get('order_id'); // THIS IS PAYMENT orderNo  
      const url_transaction_id = url.searchParams.get('transaction_id');
      const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

      if (!orderId) {//this is payment orderNo
        console.log("order id is missing--", orderId);
        return NextResponse.json({ error: 'Missing order_id parameter' }, { status: 400 });
      }
      console.log("PAYMENT order id inside return route is--", orderId);
      
      // Check payment status in the database webhook
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
          console.log("session is not found but payment state is completed--", session);
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Validate required payment state fields
        if (!paymentState.transactionId || !paymentState.currency || !paymentState.amount || !paymentState.pmId) {
          console.error("Missing required payment state fields:", paymentState);
          await sendCreateEsimFailedEmail(session.user.email, orderId);
          return NextResponse.json({ error: 'Invalid payment state' }, { status: 400 });
        }

        try {
          // Perform all database operations in a single transaction
          const result = await prisma.$transaction(async (tx) => {
            // 1. Update esimOrderBeforePayment
            const updatedOrderBeforePayment = await tx.esimOrderBeforePayment.update({
              where: {
                paymentOrderNo: orderId,
              },
              data: {
                transactionId: paymentState.transactionId,
                paymentState: 'completed',
                currency: paymentState.currency,
                updatedAt: new Date(),
              },
              include: {
                package: true,
              },
            });

        if (!updatedOrderBeforePayment) {
          console.log("Failed to update order before payment--", updatedOrderBeforePayment);
          await sendCreateEsimFailedEmail(session.user.email, orderId);
          return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
        }
        console.log("Successfully updated order before payment--", updatedOrderBeforePayment);

        // Then create the esimOrderAfterPayment record
        const orderAfterPayment = await prisma.esimOrderAfterPayment.create({
          data: {
            paymentOrderNo: orderId,
            orderNo:"PRPCESSING-" + orderId,
            userId: session.user.id,
            packageCode: updatedOrderBeforePayment.packageCode,
            status: 'PENDING',
            paymentState: 'completed',
            finalAmountPaid: Number(paymentState.amount),
            paidAmount: paymentState.amount,
            transactionId: paymentState.transactionId,
            currency: paymentState.currency,
            pmId: paymentState.pmId,
            pmName: 'payssion_tes', // You might want to make this dynamic based on the payment method
            discountCode: updatedOrderBeforePayment.discountCode,
          },
        });

        if (!orderAfterPayment) {
          console.log("Failed to create order after payment--", orderAfterPayment);
          await sendCreateEsimFailedEmail(session.user.email, orderId);
          return NextResponse.json({ error: 'Failed to create order after payment' }, { status: 500 });
        }
        console.log("Successfully created order after payment--", orderAfterPayment);

            // 3. Create processing queue entry
            const queueItem = await tx.processingQueue.create({
              data: {
                orderNo: "PRPCESSING-" + orderId,
                type: 'ESIM_ORDER',
                status: 'PENDING',
                retryCount: 0,
                createdAt: new Date(),
                updatedAt: new Date()
              }
            });

            if (!queueItem) {
              throw new Error('Failed to create processing queue entry');
            }

            return { updatedOrderBeforePayment, orderAfterPayment, queueItem };
          });

          console.log("Successfully processed payment and created order:", result);

              // 4. Send immediate confirmation email
              await sendPaymentConfirmationEmail(session.user.email, orderId);
                    // 5. Redirect to processing page
          return NextResponse.redirect(new URL(`/payment-success/${orderId}`, baseUrl));

        } catch (error) {
          console.error("Transaction failed:", error);
          await sendCreateEsimFailedEmail(session.user.email, orderId);
          throw error; // Re-throw to be caught by outer try-catch
        }
      } else {
        // Redirect to failure page using the same base URL
        console.log("payment state is failed or pending--", orderId);
        return NextResponse.redirect(new URL(`/orders/${orderId}?status=failed`, baseUrl));
      }
    } catch (error) {
      console.error(`Attempt ${retryCount + 1} failed:`, error);
      retryCount++;
      
      if (retryCount === MAX_RETRIES) {
        console.error('Max retries reached:', error);
        return NextResponse.json(
          { error: 'Failed to process payment return after multiple attempts' },
          { status: 500 }
        );
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * retryCount));
    }
  }
}

