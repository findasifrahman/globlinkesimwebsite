import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(
  req: Request,
  { params }: { params: { orderId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const order = await prisma.esimOrderAfterPayment.findFirst({
      where: {
        orderNo: params.orderId,
        userId: session.user.email,
      },
      include: {
        esimProfile: {
          select: {
            qrCode: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      orderNo: order.orderNo,
      packageCode: order.packageCode,
      qrCode: order.esimProfile?.qrCode,
      amount: order.amount,
      currency: order.currency,
      status: order.status,
      createdAt: order.createdAt,
    });
  } catch (error) {
    console.error('Error fetching eSIM order:', error);
    return NextResponse.json(
      { error: 'Failed to fetch eSIM order' },
      { status: 500 }
    );
  }
} 