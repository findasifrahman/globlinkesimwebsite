import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';


const API_URL = 'https://api.esimaccess.com/api/v1/open/esim/query';
const ACCESS_KEY = process.env.REDTEA_ACCESS_KEY;
const SECRET_KEY = process.env.REDTEA_SECRET_KEY;

function generateHmacSignature(params: string): string {
  const hmac = crypto.createHmac('sha256', SECRET_KEY!);
  hmac.update(params);
  return hmac.digest('hex');
}

export async function POST(req: Request) {
  try {
    const { orderNo, iccid, startTime, endTime, page = 1, pageSize = 10 } = await req.json();

    // Build query parameters
    const params = new URLSearchParams();
    if (orderNo) params.append('orderNo', orderNo);
    if (iccid) params.append('iccid', iccid);
    if (startTime) params.append('startTime', startTime);
    if (endTime) params.append('endTime', endTime);
    params.append('page', page.toString());
    params.append('pageSize', pageSize.toString());

    const timestamp = Date.now().toString();
    const signature = generateHmacSignature(params.toString() + timestamp);

    const response = await fetch(`${API_URL}?${params.toString()}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Access-Key': ACCESS_KEY!,
        'X-Timestamp': timestamp,
        'X-Signature': signature
      }
    });

    const data = await response.json();

    if (data.error) {
      // If profiles are not ready (error code 200010), we'll retry after a delay
      if (data.error.code === 200010) {
        return NextResponse.json({
          status: 'pending',
          message: 'eSIM profiles are still being allocated. Please try again in a few seconds.'
        });
      }
      return NextResponse.json({ error: data.error }, { status: 400 });
    }

    // Update order status in database if we have order information
    if (orderNo && data.data?.profiles) {
      for (const profile of data.data.profiles) {
        await prisma.order.update({
          where: { orderId: orderNo },
          data: {
            esimStatus: profile.esimStatus,
            status: profile.smdpStatus,
            dataUsage: profile.orderUsage || 0
          }
        });
      }
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error querying eSIM profiles:', error);
    return NextResponse.json(
      { error: 'Failed to query eSIM profiles' },
      { status: 500 }
    );
  }
} 