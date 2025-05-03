import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { queryEsimProfile } from '@/lib/esim';

// Helper function to safely convert large numbers to 32-bit integers
function safeInt32(value: number | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  // If value is too large for 32-bit int, return null
  if (value > 2147483647 || value < -2147483648) return null;
  return Math.floor(value);
}

export async function GET(
  request: Request,
  { params }: { params: { orderNo: string } }
) {
  let order = null;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { orderNo } = params;
    console.log(`[Profile Route] Fetching profile for order: ${orderNo}`);

    // Get the order and verify ownership
    order = await prisma.esimOrderAfterPayment.findFirst({
      where: {
        orderNo,
        userId: session.user.id,
      },
    });

    if (!order) {
      console.log(`[Profile Route] Order not found in database: ${orderNo}`);
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Query the eSIM profile from Redtea Mobile
    const esimProfile = await queryEsimProfile(orderNo);
    console.log(`[Profile Route] Redtea API response for ${orderNo}:`, esimProfile);
    
    // If no profile is found or API returned error, return the existing order data
    if (!esimProfile) {
      console.log(`[Profile Route] No profile data available for order: ${orderNo}`);
      return NextResponse.json({
        ...order,
        status: order.status || 'UNKNOWN',
        error: 'No profile data available'
      });
    }

    // Prepare update data with fallback values and safe number conversion
    const updateData = {
      qrCode: esimProfile.qrCode || order.qrCode,
      iccid: esimProfile.iccid || order.iccid,
      smdpStatus: esimProfile.smdpStatus || order.smdpStatus,
      esimStatus: esimProfile.esimStatus || order.esimStatus,
      dataRemaining: safeInt32(esimProfile.dataRemaining) ?? order.dataRemaining,
      dataUsed: safeInt32(esimProfile.dataUsed) ?? order.dataUsed,
      expiryDate: esimProfile.expiryDate ? new Date(esimProfile.expiryDate) : order.expiryDate,
      daysRemaining: safeInt32(esimProfile.daysRemaining) ?? order.daysRemaining,
      status: esimProfile.esimStatus || order.status || 'UNKNOWN',
      updatedAt: new Date()
    };

    // Update the order with the latest eSIM profile information
    const updatedOrder = await prisma.esimOrderAfterPayment.update({
      where: { id: order.id },
      data: updateData
    });

    console.log(`[Profile Route] Successfully updated order: ${orderNo}`);
    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error(`[Profile Route] Error processing order ${params.orderNo}:`, error);
    
    // If it's a Prisma error about integer overflow, return the order with error
    if (error instanceof Error && error.message.includes('Unable to fit integer value') && order) {
      return NextResponse.json({
        ...order,
        status: order.status || 'UNKNOWN',
        error: 'Data values too large for storage'
      });
    }

    return NextResponse.json(
      { 
        error: 'Failed to fetch order profile',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 