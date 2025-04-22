import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

const REDTEA_API_URL = 'https://api.esimaccess.com/api/v1/open/esim/order';
const REDTEA_ACCESS_CODE = process.env.ESIM_ACCESS_CODE;
const REDTEA_SECRET_KEY = process.env.ESIM_SECRET_KEY;

// Function to generate HMAC signature
function generateHmacSignature(timestamp: string, requestId: string, accessCode: string, requestBody: string, secretKey: string): string {
  // Concatenate the input parameters in the specified order
  const dataToSign = timestamp + requestId + accessCode + requestBody;
  
  // Create HMAC using SHA256 algorithm
  const hmac = crypto.createHmac('sha256', secretKey);
  
  // Update with the data to sign
  hmac.update(dataToSign);
  
  // Generate the signature and convert to lowercase hexadecimal
  return hmac.digest('hex').toLowerCase();
}

// POST endpoint for creating new orders
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if environment variables are set
    if (!REDTEA_ACCESS_CODE || !REDTEA_SECRET_KEY) {
      console.error('Missing environment variables: ESIM_ACCESS_CODE or ESIM_SECRET_KEY');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const body = await req.json();
    const { packageCode, count, price } = body;

    // Get package details
    const packageDetails = await prisma.allPackage.findUnique({
      where: { packageCode },
    });

    if (!packageDetails) {
      return NextResponse.json({ error: 'Package not found' }, { status: 404 });
    }

    // Generate timestamp and transaction ID
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    // Prepare request body
    const requestBody = JSON.stringify({
      transactionId,
      packageInfoList: [{
        packageCode,
        count,
        price,
        periodNum: packageDetails.duration
      }]
    });

    // Generate signature
    const signature = generateHmacSignature(
      timestamp,
      transactionId,
      REDTEA_ACCESS_CODE,
      requestBody,
      REDTEA_SECRET_KEY
    );

    // Create order in our database first
    const orderProfile = await prisma.orderProfile.create({
      data: {
        id: transactionId,
        userId: session.user.id,
        packageCode,
        count,
        price,
        periodNum: packageDetails.duration,
        orderNo: transactionId,
        status: 'PENDING',
      },
    });

    const order = await prisma.order.create({
      data: {
        orderNo: transactionId,
        userId: session.user.id,
        packageCode,
        status: 'PENDING',
      },
    });

    // Make request to Redtea Mobile API
    const response = await fetch(REDTEA_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Timestamp': timestamp,
        'RT-AccessCode': REDTEA_ACCESS_CODE,
        'X-Signature': signature
      },
      body: requestBody
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      // If Redtea API call fails, update order status to FAILED
      await prisma.order.update({
        where: { id: order.id },
        data: { status: 'FAILED' },
      });
      throw new Error(result.errorMsg || 'Failed to create order with provider');
    }

    // Update order with transaction ID and order number from API response
    await prisma.$transaction([
      prisma.order.update({
        where: { id: order.id },
        data: {
          orderNo: result.obj.orderNo,
          status: 'PROCESSING',
        },
      }),
      prisma.orderProfile.update({
        where: { id: orderProfile.id },
        data: {
          orderNo: result.obj.orderNo,
          status: 'PROCESSING',
        },
      }),
    ]);

    return NextResponse.json({ 
      success: true, 
      order: {
        ...order,
        orderNo: result.obj.orderNo,
      },
      orderProfile: {
        ...orderProfile,
        orderNo: result.obj.orderNo,
      },
      redirectUrl: `/orders/${result.obj.orderNo}`
    });

  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}

// GET endpoint for fetching orders
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch orders for the authenticated user
    const orders = await prisma.order.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        orderNo: true,
        userId: true,
        packageCode: true,
        status: true,
        esimStatus: true,
        smdpStatus: true,
        dataRemaining: true,
        dataUsed: true,
        expiryDate: true,
        daysRemaining: true,
        qrCode: true,
        iccid: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    console.log('Fetched orders:', orders);
    return NextResponse.json({ orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
} 