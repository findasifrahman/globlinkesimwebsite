import { NextResponse } from 'next/server';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderNo = searchParams.get('orderNo');
    
    // Debug logging
    console.log('Environment variables check:');
    console.log('REDTEA_ACCESS_KEY:', process.env.REDTEA_ACCESS_KEY ? 'Present' : 'Missing');
    console.log('REDTEA_SECRET_KEY:', process.env.REDTEA_SECRET_KEY ? 'Present' : 'Missing');
    
    // Validate that orderNo is provided
    if (!orderNo) {
      return NextResponse.json(
        { error: 'Order number is required' },
        { status: 400 }
      );
    }

    // Generate timestamp and signature
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const message = `${orderNo}${timestamp}`;
    const signature = crypto
      .createHmac('sha256', process.env.REDTEA_SECRET_KEY || '')
      .update(message)
      .digest('hex');

    const apiUrl = `https://api.redteamobile.com/api/v1/open/esim/order/${orderNo}`;
    console.log('Making API request to:', apiUrl);

    // Make API call to Redtea Mobile
    const response = await fetch(apiUrl, {
      headers: {
        'RT-AccessCode': process.env.REDTEA_ACCESS_KEY || '',
        'RT-Timestamp': timestamp,
        'RT-Signature': signature,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      throw new Error(`Failed to fetch eSIM profile: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching eSIM profile:', error);
    
    // Return a more specific error message if available
    if (error instanceof Error) {
      return NextResponse.json(
        { 
          error: error.message,
          details: error.cause || 'No additional details available'
        },
        { status: 500 }
      );
    }
    
    // Generic error response
    return NextResponse.json(
      { error: 'Failed to fetch eSIM profile' },
      { status: 500 }
    );
  }
} 