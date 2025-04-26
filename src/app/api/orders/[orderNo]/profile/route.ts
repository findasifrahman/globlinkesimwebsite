import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { queryEsimProfile } from '@/lib/esim';

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
    console.log("orderNo reciew from url---",orderNo);  //
    // Get the order and verify ownership
    const order = await prisma.order.findFirst({
      where: {
        orderNo,
        userId: session.user.id,
      },
      include: {
        profile: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Query the eSIM profile from Redtea Mobile
    const esimProfile = await queryEsimProfile(orderNo);
    console.log("esimProfile---",esimProfile);
    if (!esimProfile) {
      return NextResponse.json({ error: 'Failed to fetch eSIM profile' }, { status: 500 });
    }

    // Update the order with the latest eSIM profile information
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        qrCode: esimProfile.qrCode,
        iccid: esimProfile.iccid,
        smdpStatus: esimProfile.smdpStatus,
        esimStatus: esimProfile.esimStatus,
        dataRemaining: esimProfile.dataRemaining,
        dataUsed: esimProfile.dataUsed,
        expiryDate: esimProfile.expiryDate,
        daysRemaining: esimProfile.daysRemaining,
      },
      include: {
        profile: true,
      },
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error('Error fetching order profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order profile' },
      { status: 500 }
    );
  }
} 