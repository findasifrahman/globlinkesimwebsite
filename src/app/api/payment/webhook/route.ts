import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

const PAYSSION_SECRET_KEY = process.env.PAYSSION_SECRET_KEY;

// Function to verify Payssion webhook signature
function verifySignature(params: Record<string, string>, signature: string): boolean {
  if (!PAYSSION_SECRET_KEY) {
    console.error('PAYSSION_SECRET_KEY is not set');
    return false;
  }

  // Sort parameters alphabetically by key
  const sortedParams = Object.keys(params)
    .sort()
    .reduce((acc, key) => {
      acc[key] = params[key];
      return acc;
    }, {} as Record<string, string>);

  // Create string to sign
  let stringToSign = '';
  for (const key in sortedParams) {
    if (key !== 'sig' && sortedParams[key]) {
      stringToSign += `${key}=${sortedParams[key]}&`;
    }
  }
  stringToSign = stringToSign.slice(0, -1); // Remove trailing &

  // Calculate HMAC
  const hmac = crypto.createHmac('sha256', PAYSSION_SECRET_KEY);
  hmac.update(stringToSign);
  const calculatedSignature = hmac.digest('hex');

  // Compare signatures
  return calculatedSignature === signature;
}

export async function POST(req: Request) {
  try {
    // Parse form data
    const formData = await req.formData();
    const params: Record<string, string> = {};
    
    for (const [key, value] of formData.entries()) {
      params[key] = value.toString();
    }

    // Verify signature
    const signature = params.sig;
    if (!signature || !verifySignature(params, signature)) {
      console.error('Invalid webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Extract payment details
    const {
      transaction_id,
      order_id,
      state,
      amount,
      currency,
      pm_id
    } = params;

    console.log(`Received webhook for order ${order_id} with state ${state}`);

    // Update payment webhook state
    await prisma.paymentWebhookState.create({
      data: {
        orderId: order_id,
        status: state === 'completed' ? 'completed' : 'failed',
        transactionId: transaction_id,
        pmId: pm_id,
        amount: parseFloat(amount),
        currency,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
} 