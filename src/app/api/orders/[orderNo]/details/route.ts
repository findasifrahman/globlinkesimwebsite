import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { orderNo: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const orderNo = params.orderNo;
    if (!orderNo) {
      return new NextResponse('Order number is required', { status: 400 });
    }

    // Single database query to fetch order with all related data
    const order = await prisma.esimOrderAfterPayment.findUnique({
      where: {
        orderNo: orderNo,
        userId: session.user.id
      },
      include: {
        package: true,
        esimProfile: true
      }
    });

    if (!order) {
      return new NextResponse('Order not found', { status: 404 });
    }

    // Format the response
    const formattedOrder = {
      ...order,
      qrCode: order.qrCode || null,
      status: order.status,
      esimStatus: order.esimStatus,
      smdpStatus: order.smdpStatus,
      dataRemaining: order.dataRemaining,
      dataUsed: order.dataUsed,
      expiryDate: order.expiryDate,
      daysRemaining: order.daysRemaining,
      iccid: order.iccid,
      packageDetails: {
        packageName: order.package.packageName,
        packageCode: order.package.packageCode,
        price: order.package.price,
        currencyCode: order.package.currencyCode,
        duration: order.package.duration,
        location: order.package.location,
        speed: order.package.speed
      }
    };

    return NextResponse.json({ order: formattedOrder });
  } catch (error) {
    console.error('Error fetching order details:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 