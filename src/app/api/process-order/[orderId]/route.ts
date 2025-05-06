import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { pollForOrderStatus, queryEsimProfile } from '@/lib/esim';
import { sendEsimEmail,sendCreateEsimFailedEmail } from '@/lib/email';

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
  const session = await getServerSession(authOptions);
  try {
    const orderId = params.orderId;

    // Get order details - try both paymentOrderNo and orderNo
    const order = await prisma.esimOrderAfterPayment.findFirst({
      where: {
        OR: [
          { paymentOrderNo: orderId },
          { orderNo: orderId }
        ]
      },
      include: { package: true }
    });

    if (!order) {
      if (session?.user?.email) {
        await sendCreateEsimFailedEmail(session.user.email, orderId);
      }
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Ensure required fields are present
    if (!order.packageCode || !order.transactionId) {
      throw new Error('Missing required order fields');
    }

    // Create eSIM order
    const esimOrder = await createesimorder(
      order.packageCode,
      1,
      order.finalAmountPaid ?? 0,
      order.transactionId,
      order.paymentOrderNo ?? order.orderNo
    );

    // Check if the response indicates success
    const responseData = await esimOrder.json();
    if (!responseData.success) {
      if (session?.user?.email) {
        await sendCreateEsimFailedEmail(session.user.email, order.paymentOrderNo ?? order.orderNo);
      }
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to create eSIM order' 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      status: 'PROCESSING',
      orderNo: responseData.obj.orderNo
    });
  } catch (error) {
    console.error('Error starting order processing:', error);
    if (session?.user?.email) {
      await sendCreateEsimFailedEmail(session.user.email, params.orderId);
    }
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
  const session = await getServerSession(authOptions);
  try {
    const orderId = params.orderId;
    
    // Get current order status - try both paymentOrderNo and orderNo
    const order = await prisma.esimOrderAfterPayment.findFirst({
      where: {
        OR: [
          { paymentOrderNo: orderId },
          { orderNo: orderId }
        ]
      }
    });

    if (!order) {
      if (session?.user?.email) {
        await sendCreateEsimFailedEmail(session.user.email, orderId);
      }
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // If order is still processing, check Redtea API
    if (order.status === 'PROCESSING') {
      const { webhook_esimProfile } = await pollForOrderStatus(
        order.paymentOrderNo ?? order.orderNo,
        order.paymentOrderNo ?? order.orderNo,
        order.transactionId ?? ''
      );

      if (webhook_esimProfile) {
        // Get eSIM profile
        const esimProfile = await queryEsimProfile(webhook_esimProfile.content.orderNo);

        if (!esimProfile) {
          if (session?.user?.email) {
            await sendCreateEsimFailedEmail(session.user.email, order.paymentOrderNo ?? order.orderNo);
          }
          return NextResponse.json({ 
            status: 'FAILED',
            error: 'Failed to get eSIM profile' 
          }, { status: 500 });
        }

        // Update order with eSIM details
        await prisma.esimOrderAfterPayment.updateMany({
          where: { 
            OR: [
              { paymentOrderNo: orderId },
              { orderNo: orderId }
            ]
          },
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

        // Fetch the updated order
        const updatedOrder = await prisma.esimOrderAfterPayment.findFirst({
          where: {
            OR: [
              { paymentOrderNo: orderId },
              { orderNo: orderId }
            ]
          }
        });

        if (!updatedOrder) {
          throw new Error('Failed to fetch updated order');
        }

        // Get user email before sending
        const user = await prisma.user.findUnique({
          where: { id: order.userId },
          select: { email: true }
        });

        if (!user?.email) {
          throw new Error('User email not found');
        }

        // Send eSIM email
        await sendEsimEmail(user.email, order.paymentOrderNo ?? order.orderNo, {
          ...esimProfile,
          packageCode: order.packageCode,
          amount: order.finalAmountPaid ?? 0,
          currency: order.currency ?? 'USD',
          discountCode: order.discountCode ?? undefined,
        });

        // Update processing queue using id
        const queueItem = await prisma.processingQueue.findFirst({
          where: { 
            OR: [
              { orderNo: order.paymentOrderNo ?? '' },
              { orderNo: order.orderNo }
            ]
          }
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
          where: { 
            OR: [
              { orderNo: order.paymentOrderNo ?? '' },
              { orderNo: order.orderNo }
            ]
          }
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
      where: { 
        OR: [
          { orderNo: params.orderId },
          { orderNo: params.orderId }
        ]
      }
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

export async function createesimorder(packageCode: string, count: number, price: number, transactionId: string, paymentOrderNo: string): Promise<NextResponse> {
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 5000; // 5 seconds between retries
  let retryCount = 0;
  let lastError: string | null = null;

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

    while (retryCount < MAX_RETRIES) {
      try {
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
        console.log(`Attempt ${retryCount + 1} result from esim order after payment in createesimorder--`, result);

        if (response.ok && result.success) {
          // Find the processing queue item first
          const queueItem = await prisma.processingQueue.findFirst({
            where: { orderNo: "PRPCESSING-" + paymentOrderNo }
          });

          if (!queueItem) {
            throw new Error('Processing queue item not found');
          }

          // Update both esimOrderAfterPayment and processingQueue in a transaction
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
            }),
            prisma.processingQueue.update({
              where: { id: queueItem.id },
              data: {
                orderNo: result.obj.orderNo,
                status: 'PROCESSING',
                updatedAt: new Date()
              }
            })
          ]);
          
          return NextResponse.json({ 
            success: true, 
            obj: result.obj
          });
        }

        // If we get here, the API call failed
        lastError = result.errorMsg || 'API call failed';
        retryCount++;
        
        if (retryCount < MAX_RETRIES) {
          console.log(`Retrying eSIM creation (attempt ${retryCount + 1}/${MAX_RETRIES})...`);
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
          continue;
        }

        // Find the processing queue item
        const queueItem = await prisma.processingQueue.findFirst({
          where: { orderNo: "PRPCESSING-" + paymentOrderNo }
        });

        if (!queueItem) {
          throw new Error('Processing queue item not found');
        }

        // If we've exhausted all retries, mark as failed
        await prisma.$transaction([
          prisma.esimOrderAfterPayment.update({
            where: { paymentOrderNo: paymentOrderNo },
            data: { 
              orderNo: "FAILED-" + paymentOrderNo,
              status: 'FAILED',
              smdpStatus: lastError
            },
          }),
          prisma.processingQueue.update({
            where: { id: queueItem.id },
            data: {
              status: 'FAILED',
              error: lastError,
              updatedAt: new Date()
            }
          })
        ]);
        
        throw new Error(lastError || 'Failed to create order with provider after multiple attempts');
      } catch (error) {
        lastError = error instanceof Error ? error.message : 'Unknown error occurred';
        if (retryCount === MAX_RETRIES - 1) {
          // Find the processing queue item
          const queueItem = await prisma.processingQueue.findFirst({
            where: { orderNo: "PRPCESSING-" + paymentOrderNo }
          });

          if (!queueItem) {
            throw new Error('Processing queue item not found');
          }

          // Last retry failed, mark as failed
          await prisma.$transaction([
            prisma.esimOrderAfterPayment.update({
              where: { paymentOrderNo: paymentOrderNo },
              data: { 
                orderNo: "FAILED-" + paymentOrderNo,
                status: 'FAILED',
                smdpStatus: lastError
              },
            }),
            prisma.processingQueue.update({
              where: { id: queueItem.id },
              data: {
                status: 'FAILED',
                error: lastError,
                updatedAt: new Date()
              }
            })
          ]);
          throw error;
        }
        retryCount++;
        console.log(`Retrying after error (attempt ${retryCount}/${MAX_RETRIES}):`, error);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      }
    }

    throw new Error(lastError || 'Failed to create order after maximum retries');
  } catch (error) {
    console.error('Error creating esim order:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}