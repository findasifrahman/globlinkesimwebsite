import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { md5sum } from '@/utils/hash';

const PAYSSION_API_URL = process.env.PAYSSION_CREATE_PAYMENT;
const PAYSSION_API_KEY = process.env.PAYSSION_API_KEY;
const PAYSSION_SECRET_KEY = process.env.PAYSSION_SECRET_KEY;
const PAYSSION_RETURN_URL = process.env.PAYSSION_RETURN_GLOBLINK_URL;
const PAYSSION_WEBHOOK_URL = process.env.PAYSSION_WEBHOOK_RAILWAY_URL;

export async function POST(req: Request) {
  console.log('PAYSSION_API_KEY', PAYSSION_API_KEY);
  console.log('PAYSSION_SECRET_KEY', PAYSSION_SECRET_KEY);
  console.log('PAYSSION_RETURN_URL', PAYSSION_RETURN_URL);
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if environment variables are set
    if (!PAYSSION_API_KEY || !PAYSSION_SECRET_KEY || !PAYSSION_RETURN_URL) {
      console.error('Missing environment variables: PAYSSION_API_KEY, PAYSSION_SECRET_KEY, or PAYSSION_RETURN_URL');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const body = await req.json();
    const { orderId, amount, currency, description } = body;

    if (!orderId || !amount || !currency) {
      console.error('Missing required parameters:', { orderId, amount, currency });
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // Generate signature
    const apiSig = md5sum(
      PAYSSION_API_KEY,
      'payssion_test', // Using test payment method
      amount.toString(),
      currency,
      orderId,
      PAYSSION_SECRET_KEY
    );

    // Prepare form data for Payssion API
    const formData = new URLSearchParams();
    formData.append('api_key', PAYSSION_API_KEY);
    formData.append('api_sig', apiSig);
    formData.append('pm_id', 'payssion_test');
    formData.append('amount', amount.toString());
    formData.append('currency', currency);
    formData.append('order_id', orderId);
    formData.append('description', description || `eSIM Order ${orderId}`);
    formData.append('return_url', PAYSSION_RETURN_URL);
    
    // Add optional parameters if available
    if (session.user.email) {
      formData.append('payer_email', session.user.email);
    }
    
    if (session.user.name) {
      formData.append('payer_name', session.user.name);
    }

    // Make request to Payssion API
    const response = await fetch(PAYSSION_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    const result = await response.json();

    if (!response.ok || result.result_code !== 200) {
      console.error('Payssion API error:', result);
      return NextResponse.json({ 
        error: 'Failed to create payment', 
        details: result.error_msg || 'Unknown error' 
      }, { status: 500 });
    }

    // Create payment webhook state record
   /*await prisma.paymentWebhookState.create({
      data: {
        orderId,
        status: 'pending',
        pmId: 'payssion_test',
        amount: parseFloat(amount),
        currency,
        userId: session.user.id,
      },
    });*/

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error creating payment:', error);
    return NextResponse.json(
      { error: 'Failed to create payment' },
      { status: 500 }
    );
  }
} 