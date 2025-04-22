import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { sql } from '@vercel/postgres';
import crypto from 'crypto';

export async function GET(
  request: Request,
  { params }: { params: { orderNo: string } }
) {
  try {
    const headersList = headers();
    const userId = headersList.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify order belongs to user
    const orderResult = await sql`
      SELECT orderNo, transactionId
      FROM orderProfile
      WHERE orderNo = ${params.orderNo}
      AND userId = ${userId};
    `;

    if (orderResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const payload = {
      orderNo: params.orderNo,
      transactionId: orderResult.rows[0].transactionid,
    };

    // Generate signature
    const message = `${JSON.stringify(payload)}${timestamp}`;
    const signature = crypto
      .createHmac('sha256', process.env.NEXT_PUBLIC_ESIM_API_SECRET || '')
      .update(message)
      .digest('hex');

    // Call eSIM API
    const response = await fetch('https://api.esimaccess.com/api/v1/open/esim/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': process.env.NEXT_PUBLIC_ESIM_API_KEY || '',
        'X-Timestamp': timestamp.toString(),
        'X-Signature': signature,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch eSIM details');
    }

    const data = await response.json();

    // Transform the response to match our frontend needs
    return NextResponse.json({
      status: data.status,
      qrCode: data.qrCode,
      iccid: data.iccid,
      expiry: data.expiryTime,
      dataUsage: {
        used: parseFloat(data.usedData || '0'),
        total: parseFloat(data.totalData || '0'),
      },
      canTopUp: data.canTopup || false,
    });
  } catch (error) {
    console.error('Error querying eSIM:', error);
    return NextResponse.json(
      { error: 'Failed to fetch eSIM details' },
      { status: 500 }
    );
  }
} 