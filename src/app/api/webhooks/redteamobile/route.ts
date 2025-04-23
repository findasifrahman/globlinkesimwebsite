import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { processWebhookEvent, WebhookPayload } from '@/lib/webhook';
import { generateHmacSignature } from '@/lib/utils';

/**
 * This route is deprecated. All webhook requests should be sent to the external webhook service.
 * See .env.local for the WEBHOOK_URL configuration.
 */
export async function POST(request: Request) {
  console.log('[Redtea Webhook] DEPRECATED: This webhook endpoint is deprecated.');
  console.log('[Redtea Webhook] All webhook requests should be sent to the external webhook service.');
  console.log('[Redtea Webhook] See .env.local for the WEBHOOK_URL configuration.');
  
  return NextResponse.json(
    { 
      error: 'This webhook endpoint is deprecated',
      message: 'All webhook requests should be sent to the external webhook service',
      correctEndpoint: process.env.WEBHOOK_URL || 'https://globlinkesimwebhook-production.up.railway.app/globlinkesimwebhook'
    },
    { status: 410 } // 410 Gone
  );
} 