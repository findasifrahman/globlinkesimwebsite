import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderNo = searchParams.get('orderNo');

    if (!orderNo) {
      return NextResponse.json(
        { error: 'Order number is required' },
        { status: 400 }
      );
    }

    // Your existing API call logic here
    const response = await fetch(`https://api.esimaccess.com/api/v1/open/esim/order/${orderNo}`, {
      headers: {
        'RT-AccessCode': process.env.ESIM_ACCESS_CODE || '',
        'RT-Timestamp': Math.floor(Date.now() / 1000).toString(),
        'RT-Signature': process.env.ESIM_SIGNATURE || '',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch eSIM profile');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching eSIM profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch eSIM profile' },
      { status: 500 }
    );
  }
} 