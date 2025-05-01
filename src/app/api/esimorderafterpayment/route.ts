import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import crypto from 'crypto';

const REDTEA_API_URL = 'https://api.esimaccess.com/api/v1/open/esim/order';
const REDTEA_ACCESS_CODE = process.env.ESIM_ACCESS_CODE;
const REDTEA_SECRET_KEY = process.env.ESIM_SECRET_KEY;

// Function to generate HMAC signature
function generateHmacSignature(timestamp: string, requestId: string, accessCode: string, requestBody: string, secretKey: string): string {
  const dataToSign = timestamp + requestId + accessCode + requestBody;
  const hmac = crypto.createHmac('sha256', secretKey);
  hmac.update(dataToSign);
  return hmac.digest('hex').toLowerCase();
}

// Function to poll for order status
async function pollOrderStatus(orderNo: string, maxAttempts: number = 12, interval: number = 5000): Promise<any> {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await fetch(`${REDTEA_API_URL}/${orderNo}`, {
        headers: {
          'RT-AccessCode': REDTEA_ACCESS_CODE!,
          'X-Timestamp': Date.now().toString(),
        },
      });

      const result = await response.json();
      if (result.success && result.obj.status === 'SUCCESS') {
        return result;
      }
    } catch (error) {
      console.error('Error polling order status:', error);
    }
    await new Promise(resolve => setTimeout(resolve, interval));
  }
  throw new Error('Order status polling timeout');
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { order_id, transaction_id, status, pm_id, amount, currency, userId } = body;
    var paid_amount_from_payment = amount;

    if (!order_id || !transaction_id || !status || !pm_id || !amount || !currency || !userId) {
        console.log("Missing required fields in esimorderafterpayment", body);
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if payment was successful
    if (status !== 'completed') {
      return NextResponse.json(
        { error: 'Payment not completed' },
        { status: 400 }
      );
    }

    // Get the order data from esimOrderBeforePayment
    const orderBeforePayment = await prisma.esimOrderBeforePayment.findFirst({
      where: {
        orderNo: order_id,
        userId: session.user.email,
      },
    });

    if (!orderBeforePayment) {
        console.log("Order not found in esimorderafterpayment", order_id);
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Prepare request to Redtea API
    const timestamp = Date.now().toString();
    const transactionId = crypto.randomUUID();
    const requestBody = JSON.stringify({
      packageCode: orderBeforePayment.packageCode,
      quantity: orderBeforePayment.count,
      amount: orderBeforePayment.amount,
      currency: orderBeforePayment.currency,
    });

    const signature = generateHmacSignature(
      timestamp,
      transactionId,
      REDTEA_ACCESS_CODE!,
      requestBody,
      REDTEA_SECRET_KEY!
    );

    // Make request to Redtea API
    const response = await fetch(REDTEA_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Timestamp': timestamp,
        'RT-AccessCode': REDTEA_ACCESS_CODE!,
        'X-Signature': signature,
      },
      body: requestBody,
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.errorMsg || 'Failed to create order with provider');
    }

    // Poll for order status
    const orderStatus = await pollOrderStatus(result.obj.orderNo);

    // Update order status in database
    await prisma.$transaction([
      prisma.esimOrderAfterPayment.create({
        data: {
          orderNo: result.obj.orderNo,
          userId: session.user.email,
          packageCode: orderBeforePayment.packageCode,
          count: orderBeforePayment.count,
          amount: orderBeforePayment.amount,
          currency: orderBeforePayment.currency,
          status: 'COMPLETED',
          transactionId: transaction_id,
          pmId: pm_id,
          paymentState: 'COMPLETED',
          paidAmount: paid_amount_from_payment
        },
      }),
      prisma.esimOrderBeforePayment.update({
        where: { id: orderBeforePayment.id },
        data: { 
            status: 'COMPLETED',
            transactionId: transaction_id,
            paymentState: 'COMPLETED',
        },
      }),
    ]);

    return NextResponse.json({ 
      success: true, 
      order: result.obj,
      status: orderStatus.obj.status 
    });
  } catch (error) {
    console.error('Error processing eSIM order:', error);
    return NextResponse.json(
      { error: 'Failed to process eSIM order' },
      { status: 500 }
    );
  }
} 