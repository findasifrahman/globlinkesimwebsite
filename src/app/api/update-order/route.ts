import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderNo, status, dataRemaining, dataUsed, smdpStatus, qrCode, daysRemaining } = body;

    // Validate required fields
    if (!orderNo) {
      return NextResponse.json(
        { error: 'Order number is required' },
        { status: 400 }
      );
    }
    console.log('got request to update order---:', orderNo, status, dataRemaining, dataUsed, smdpStatus, qrCode);
    if(!status){
      console.error('Error updating order: status is required');
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }
    // Update the order in the database
    const updatedOrder = await prisma.esimOrderAfterPayment.update({
      where: { orderNo },
      data: {
        status: status !== undefined ? status : undefined,
        dataRemaining: dataRemaining !== undefined ? dataRemaining : undefined,
        dataUsed: dataUsed !== undefined ? dataUsed : undefined,
        smdpStatus: smdpStatus !== undefined ? smdpStatus : undefined,
        daysRemaining: daysRemaining !== undefined ? daysRemaining : undefined,
        qrCode: qrCode !== undefined ? qrCode : undefined,
      },
    });

    return NextResponse.json({ success: true, data: updatedOrder });
  } catch (error) {
    console.error('Error updating order:', error);
    
    // Return a more specific error message if available
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    // Generic error response
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
} 