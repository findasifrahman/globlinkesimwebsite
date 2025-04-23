import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { sql } from '@vercel/postgres';
import crypto from 'crypto';

export async function POST(
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
      SELECT orderNo, transactionId, packageCode, count
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

    const order = orderResult.rows[0];
    const timestamp = Math.floor(Date.now() / 1000);
    const payload = {
      orderNo: params.orderNo,
      transactionId: order.transactionid,
      packageCode: order.packagecode,
      count: order.count,
    };

    // Generate signature
    const message = `${JSON.stringify(payload)}${timestamp}`;
    const signature = crypto
      .createHmac('sha256', process.env.NEXT_PUBLIC_ESIM_API_SECRET || '')
      .update(message)
      .digest('hex');

    // Call eSIM API for top-up
    const response = await fetch('https://api.esimaccess.com/api/v1/open/esim/topup', {
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
      throw new Error('Failed to process top-up');
    }

    const data = await response.json();

    // Create a new order record for the top-up
    await sql`
      INSERT INTO orderProfile (
        userId,
        orderNo,
        transactionId,
        packageCode,
        count,
        price,
        periodNum,
        status,
        parentOrderNo,
        createdAt,
        updatedAt
      ) VALUES (
        ${userId},
        ${data.orderNo},
        ${data.transactionId},
        ${order.packagecode},
        ${order.count},
        ${data.price || 0},
        ${data.periodNum || 0},
        'PENDING',
        ${params.orderNo},
        NOW(),
        NOW()
      );
    `;

    return NextResponse.json({
      message: 'Top-up initiated successfully',
      orderNo: data.orderNo,
    });
  } catch (error) {
    console.error('Error processing top-up:', error);
    return NextResponse.json(
      { error: 'Failed to process top-up' },
      { status: 500 }
    );
  }
} 