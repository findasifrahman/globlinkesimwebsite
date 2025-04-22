import { NextRequest, NextResponse } from 'next/server';
import { queryEsimProfile } from '@/lib/esim';

export async function GET(request: NextRequest) {
  try {
    // Get the orderNo from the query parameters
    const searchParams = request.nextUrl.searchParams;
    const orderNo = searchParams.get('orderNo');
    //console.log('Order number from api/fetch-order-profile-single:', orderNo);
    // Validate that orderNo is provided
    if (!orderNo) {
      return NextResponse.json(
        { error: 'Order number is required' },
        { status: 400 }
      );
    }

    // Call the queryEsimProfile function to get the profile data
    const profile = await queryEsimProfile(orderNo);
    //console.log('Esim profile from api/fetch-order-profile-single:', profile);
    // Return the profile data
    return NextResponse.json({ success: true, data: profile });
  } catch (error) {
    console.error('Error fetching eSIM profile:', error);
    
    // Return a more specific error message if available
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
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