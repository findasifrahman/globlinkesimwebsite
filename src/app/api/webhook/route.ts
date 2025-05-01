import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateHmacSignature } from '@/lib/utils';
import { sendEmail, sendEsimEmail } from '@/lib/email';
import { processWebhookEvent, WebhookPayload } from '@/lib/webhook';

// Define webhook payload types
type WebhookPayloadLegacy = {
  type: 'ORDER_STATUS' | 'ESIM_STATUS' | 'DATA_USAGE' | 'VALIDITY_USAGE';
  orderNo: string;
  transactionId?: string;
  iccid?: string;
  status?: string;
  smdpStatus?: string;
  dataRemaining?: number;
  dataUsed?: number;
  expiryDate?: string;
  daysRemaining?: number;
};

async function queryEsimProfile(orderNo: string) {
  console.log(`[queryEsimProfile] Starting query for order: ${orderNo}`);
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const body = JSON.stringify({ orderNo });
  const signature = generateHmacSignature(body, process.env.ESIM_SECRET_KEY || '');

  console.log(`[queryEsimProfile] Making API request to query eSIM profile`);
  const response = await fetch(`${process.env.ESIM_API_URL}/query-esim-profile`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Timestamp': timestamp,
      'X-Signature': signature,
    },
    body,
  });

  if (!response.ok) {
    console.error(`[queryEsimProfile] API request failed with status: ${response.status}`);
    throw new Error(`Failed to query eSIM profile: ${response.statusText}`);
  }

  const data = await response.json();
  console.log(`[queryEsimProfile] Successfully retrieved eSIM profile for order: ${orderNo}`);
  console.log(`[queryEsimProfile] Profile data:`, JSON.stringify(data, null, 2));
  return data;
}

/**
 * This route is deprecated. All webhook requests should be sent to the external webhook service.
 * See .env.local for the WEBHOOK_URL configuration.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orderNo, status, qrCode } = body;

    if (!orderNo || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Find the order
    const order = await prisma.esimOrderAfterPayment.findFirst({
      where: { orderNo },
      include: {
        user: {
          select: {
            email: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Update order status
    await prisma.esimOrderAfterPayment.update({
      where: { id: order.id },
      data: { status },
    });

    // If order is complete and has QR code, send email and update esimProfile
    if (status === 'COMPLETED' && qrCode) {
      // Create or update esimProfile
      await prisma.esimProfile.upsert({
        where: { orderId: order.id },
        update: { qrCode },
        create: {
          orderId: order.id,
          qrCode,
          status: 'ACTIVE',
        },
      });

      // Send email to user
      if (order.user?.email) {
        await sendEsimEmail(
          order.user.email,
          orderNo,
          {
            qrCode,
            packageCode: order.packageCode,
            amount: order.amount,
            currency: order.currency,
          }
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
} 