import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateHmacSignature } from '@/lib/utils';
import { sendEmail } from '@/lib/email';
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
export async function POST(request: Request) {
  console.log('==================================================');
  console.log('[Webhook] DEPRECATED: This webhook endpoint is deprecated.');
  console.log('[Webhook] All webhook requests should be sent to the external webhook service.');
  console.log('[Webhook] See .env.local for the WEBHOOK_URL configuration.');
  console.log('==================================================');
  
  return NextResponse.json(
    { 
      error: 'This webhook endpoint is deprecated',
      message: 'All webhook requests should be sent to the external webhook service',
      correctEndpoint: process.env.WEBHOOK_URL || 'https://globlinkesimwebhook-production.up.railway.app/globlinkesimwebhook'
    },
    { status: 410 } // 410 Gone
  );
} 