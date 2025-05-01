import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { pollForOrderStatus, queryEsimProfile } from '@/lib/esim';
import { sendEsimEmail,sendPaymentConfirmationEmail } from '@/lib/email';

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

export async function POST(
  request: Request,
  { params }: { params: { orderId: string } }
) {
  try {
    const orderId = params.orderId;
    
    // Get order details
    const order = await prisma.esimOrderAfterPayment.findUnique({
      where: { paymentOrderNo: orderId },
      include: { package: true }
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Create eSIM order
    const esimOrder = await createesimorder(
      order.packageCode,
      1,
      order.finalAmountPaid,
      order.transactionId,
      orderId
    );


    return NextResponse.json({ 
      success: true, 
      status: 'PROCESSING',
      orderNo: esimOrder.orderNo
    });
  } catch (error) {
    console.error('Error starting order processing:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to start order processing' 
    }, { status: 500 });
  }
}

export async function GET(
  request: Request,
  { params }: { params: { orderId: string } }
) {
  try {
    const orderId = params.orderId;
    
    // Get current order status
    const order = await prisma.esimOrderAfterPayment.findUnique({
      where: { paymentOrderNo: orderId }
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // If order is still processing, check Redtea API
    if (order.status === 'PROCESSING') {
      const { webhook_esimProfile } = await pollForOrderStatus(
        orderId,
        orderId,
        order.transactionId
      );

      if (webhook_esimProfile) {
        // Get eSIM profile
        const esimProfile = await queryEsimProfile(webhook_esimProfile.content.orderNo);

        // Update order with eSIM details
        const updatedOrder = await prisma.esimOrderAfterPayment.update({
          where: { paymentOrderNo: orderId },
          data: {
            status: 'GOT_RESOURCE',
            qrCode: esimProfile.qrCode,
            iccid: esimProfile.iccid,
            smdpStatus: esimProfile.smdpStatus,
            esimStatus: esimProfile.esimStatus,
            dataRemaining: esimProfile.dataRemaining,
            dataUsed: esimProfile.dataUsed,
            expiryDate: esimProfile.expiryDate ? new Date(esimProfile.expiryDate) : null,
            daysRemaining: esimProfile.daysRemaining,
          }
        });

        // Get user email before sending
        const user = await prisma.user.findUnique({
          where: { id: order.userId },
          select: { email: true }
        });

        if (!user?.email) {
          throw new Error('User email not found');
        }

        // Send eSIM email
        await sendEsimEmail(user.email, orderId, {
          ...esimProfile,
          packageCode: order.packageCode,
          amount: order.finalAmountPaid,
          currency: order.currency,
          discountCode: order.discountCode,
        });

        // Update processing queue using id
        const queueItem = await prisma.processingQueue.findFirst({
          where: { orderNo: orderId }
        });

        if (queueItem) {
          await prisma.processingQueue.update({
            where: { id: queueItem.id },
            data: {
              status: 'COMPLETED',
              updatedAt: new Date()
            }
          });
        }

        return NextResponse.json({ 
          status: 'GOT_RESOURCE',
          orderNo: updatedOrder.orderNo
        });
      } else {
        // failed to get resource
        const queueItem = await prisma.processingQueue.findFirst({
          where: { orderNo: orderId }
        });

        if (queueItem) {
          await prisma.processingQueue.update({
            where: { id: queueItem.id },
            data: {
              status: 'RETRY',
              retryCount: { increment: 1 },
              lastAttempt: new Date(),
              updatedAt: new Date()
            }
          });
        }
        return NextResponse.json({ status: 'PROCESSING' });
      }
    }

    // Return current status
    return NextResponse.json({ 
      status: order.status,
      orderNo: order.orderNo
    });
  } catch (error) {
    console.error('Error checking order status:', error);
    
    // Update queue with error using id
    const queueItem = await prisma.processingQueue.findFirst({
      where: { orderNo: params.orderId }
    });

    if (queueItem) {
      await prisma.processingQueue.update({
        where: { id: queueItem.id },
        data: {
          status: 'FAILED',
          error: String(error),
          retryCount: { increment: 1 },
          lastAttempt: new Date(),
          updatedAt: new Date()
        }
      });
    }

    return NextResponse.json({ 
      status: 'FAILED',
      error: 'Failed to check order status' 
    }, { status: 500 });
  }
}

async function createesimorder(packageCode: string, count: number, price: number,transactionId: string, paymentOrderNo: string) : Promise<NextResponse>
 {
  try {


    // Check if environment variables are set
    if (!REDTEA_ACCESS_CODE || !REDTEA_SECRET_KEY) {
      console.error('Missing environment variables: ESIM_ACCESS_CODE or ESIM_SECRET_KEY');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }



    // Get package details
    const packageDetails = await prisma.allPackage.findUnique({
      where: { packageCode },
    });
    console.log("package details are in return route--", packageDetails);
    if (!packageDetails) {
      return NextResponse.json({ error: 'Package not found' }, { status: 404 });
    }

    // Generate timestamp and transaction ID
    const timestamp = Math.floor(Date.now() / 1000).toString();
    //const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

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
    console.log("result from esim order after payment in createesimorder--", result);
    if (!response.ok || !result.success) {
      // If Redtea API call fails, update order status to FAILED
      await prisma.esimOrderAfterPayment.update({
        where: { paymentOrderNo: paymentOrderNo },
        data: { 
          orderNo: result.obj.orderNo,
          status: 'FAILED' 
        },
      });
      throw new Error(result.errorMsg || 'Failed to create order with provider');
    }

    // Update order with esim order number from API response
    try {
      await prisma.$transaction([
        prisma.esimOrderAfterPayment.update({
          where: { paymentOrderNo: paymentOrderNo },
          data: {
            orderNo: result.obj.orderNo,
            status: 'PROCESSING',
          },
        }),
        prisma.esimOrderBeforePayment.update({
          where: { paymentOrderNo: paymentOrderNo },
          data: {
            orderNo: result.obj.orderNo,
            status: 'PROCESSING',
          },
        })
      ]);
      
      return NextResponse.json({ 
        success: true, 
        orderNo: result.obj.orderNo
      });
    } catch (error) {
      console.error('Error updating order:', error);
      return NextResponse.json({ 
        success: false,
        error: 'Failed to update order'
      }, { status: 500 });
      throw new Error('Failed to update order');
    }

    /*return NextResponse.json({ 
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
    });*/

  } catch (error) {
    console.error('Error creating esim order:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}