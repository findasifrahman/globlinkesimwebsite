import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { queryEsimProfile } from '@/lib/esim';
import { esimOrderAfterPayment } from '@prisma/client';

interface EsimProfileResponse {
  success: boolean;
  errorCode: string;
  errorMsg: string | null;
  obj: {
    esimList: Array<{
      esimStatus: string;
      totalVolume: number;
      orderUsage: number;
      smdpStatus: string;
      qrCodeUrl: string;
      iccid: string;
      expiredTime: string;
      totalDuration: number;
      packageList: Array<{
        packageCode: string;
      }>;
    }>;
  };
}

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
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { orderNo } = params;
    console.log(`[Profile Route] Fetching profile for order: ${orderNo}`);

    // Get the order and verify ownership
    const order = await prisma.esimOrderAfterPayment.findFirst({
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
    const esimProfileResponse = await queryEsimProfile(orderNo);
    const esimProfile = esimProfileResponse as unknown as EsimProfileResponse;
    console.log(`[Profile Route] Redtea API response for ${orderNo}:`, esimProfile);
    
    // If no profile is found or API returned error, return the existing order data
    if (!esimProfile?.success || !esimProfile.obj?.esimList?.[0]) {
      console.log(`[Profile Route] No profile data available for order: ${orderNo}`);
      return NextResponse.json({
        ...order,
        status: order.status || 'UNKNOWN',
        error: 'No profile data available',
        dataRemaining: order.dataRemaining?.toString() || null,
        dataUsed: order.dataUsed?.toString() || null,
      });
    }

    const esimData = esimProfile.obj.esimList[0];

    // Format the response and convert large numbers to strings
    const formattedResponse = {
      ...order,
      status: esimData.esimStatus || order.status || 'UNKNOWN',
      dataRemaining: esimData.totalVolume?.toString() || order.dataRemaining?.toString() || null,
      dataUsed: esimData.orderUsage?.toString() || order.dataUsed?.toString() || null,
      smdpStatus: esimData.smdpStatus || order.smdpStatus,
      qrCode: esimData.qrCodeUrl || order.qrCode,
      iccid: esimData.iccid || order.iccid,
      expiryDate: esimData.expiredTime || order.expiryDate,
      daysRemaining: esimData.totalDuration || order.daysRemaining,
      packageCode: esimData.packageList?.[0]?.packageCode || order.packageCode,
    };

    return NextResponse.json(formattedResponse);
  } catch (error) {
    console.error('Error fetching eSIM profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch eSIM profile' },
      { status: 500 }
    );
  }
} 