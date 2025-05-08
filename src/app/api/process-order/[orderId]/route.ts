import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { pollForOrderStatus, queryEsimProfile } from '@/lib/esim';
import { sendEsimEmail, sendCreateEsimFailedEmail } from '@/lib/email';

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

    // Check retry count
    if (order.retryCount >= 3) {
      if (session?.user?.email) {
        await sendCreateEsimFailedEmail(session.user.email, order.paymentOrderNo ?? order.orderNo);
      }
      return NextResponse.json({ 
        success: false, 
        error: 'Maximum retry attempts reached' 
      }, { status: 400 });
    }

    // Ensure required fields are present
    if (!order.packageCode || !order.transactionId) {
      throw new Error('Missing required order fields');
    }

    // Create eSIM order
    const esimOrder = await createesimorder(
      order.packageCode,
      1,
      order.order.package.price ?? 0,
      order.transactionId,
      order.paymentOrderNo ?? order.orderNo
    );

    // Check if the response indicates success
    const responseData = await esimOrder.json();
    if (!responseData.success) {
      // Increment retry count and update status
      await prisma.esimOrderAfterPayment.update({
        where: { id: order.id },
        data: { 
          retryCount: { increment: 1 },
          status: 'FAILED'
        }
      });

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

        /// send email to user
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



        return NextResponse.json({ 
          status: 'GOT_RESOURCE',
          orderNo: updatedOrder.orderNo
        });
      }
      return NextResponse.json({ status: 'PROCESSING' });
    }

    // Return current status
    return NextResponse.json({ 
      status: order.status,
      orderNo: order.orderNo
    });
  } catch (error) {
    console.error('Error checking order status:', error);
    return NextResponse.json({ 
      status: 'FAILED',
      error: 'Failed to check order status' 
    }, { status: 500 });
  }
}

export async function createesimorder(packageCode: string, count: number, price: number, transactionId: string, paymentOrderNo: string): Promise<NextResponse> {
  try {
    // Check if environment variables are set
    if (!REDTEA_ACCESS_CODE || !REDTEA_SECRET_KEY) {
      console.error('Missing environment variables: ESIM_ACCESS_CODE or ESIM_SECRET_KEY');
      return NextResponse.json({ 
        success: false,
        error: 'Server configuration error' 
      }, { status: 500 });
    }

    // Get package details
    const packageDetails = await prisma.allPackage.findUnique({
      where: { packageCode },
    });
    console.log("package details are in return route--", packageDetails);

    if (!packageDetails) {
      return NextResponse.json({ 
        success: false,
        error: 'Package not found' 
      }, { status: 404 });
    }

    // Generate timestamp
    const timestamp = Math.floor(Date.now() / 1000).toString();

    console.log("creating esim order in createesimorder route--", timestamp);
    // Prepare request body
    const requestBody = JSON.stringify({
      transactionId,
      packageInfoList: [{
        packageCode,
        count,
        price: price,//packageDetails.price, // get price from package details not the parameter
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

    // Check for price expiration error
    if (!result.success && result.errorCode === '200005') {
      console.log("Package price expired, fetching updated price...");
      
      // Fetch updated package details using absolute URL
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      const updatedPackageResponse = await fetch(`${baseUrl}/api/getEsimPackageByCode`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ packageCode })
      });

      const updatedPackageResult = await updatedPackageResponse.json();
      
      if (!updatedPackageResult.success) {
        return NextResponse.json({ 
          success: false,
          error: 'Failed to fetch updated package price' 
        }, { status: 500 });
      }

      // Update package price in database
      await prisma.allPackage.update({
        where: { packageCode },
        data: { price: updatedPackageResult.package.price }
      });

      // Retry eSIM creation with updated price
      const retryRequestBody = JSON.stringify({
        transactionId,
        packageInfoList: [{
          packageCode,
          count,
          price: updatedPackageResult.package.price,
          periodNum: packageDetails.duration
        }]
      });

      const retrySignature = generateHmacSignature(
        timestamp,
        transactionId,
        REDTEA_ACCESS_CODE,
        retryRequestBody,
        REDTEA_SECRET_KEY
      );

      const retryResponse = await fetch(REDTEA_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'RT-Timestamp': timestamp,
          'RT-AccessCode': REDTEA_ACCESS_CODE,
          'RT-Signature': retrySignature
        },
        body: retryRequestBody
      });

      const retryResult = await retryResponse.json();
      
      // Update order status with retry result
      if (retryResult.success) {
        try {
          await prisma.$transaction([
            prisma.esimOrderAfterPayment.update({
              where: { paymentOrderNo: paymentOrderNo },
              data: {
                orderNo: retryResult.obj.orderNo,
                status: 'PROCESSING',
              },
            }),
            prisma.esimOrderBeforePayment.update({
              where: { paymentOrderNo: paymentOrderNo },
              data: {
                orderNo: retryResult.obj.orderNo,
                status: 'PROCESSING',
              },
            }),
          ]);

          return NextResponse.json({ 
            success: true, 
            obj: retryResult.obj
          });
        } catch (dbError) {
          console.error('Error updating order after successful retry:', dbError);
          return NextResponse.json({ 
            success: false,
            error: 'Failed to update order in database',
            apiSuccess: true // Indicate that API call was successful
          }, { status: 500 });
        }
      }

      return NextResponse.json(retryResult);
    }

    // Handle non-price-expiration errors
    if (!result.success) {
      try {
        // If Redtea API call fails, update order status to FAILED
        await prisma.esimOrderAfterPayment.update({
          where: { paymentOrderNo: paymentOrderNo },
          data: { 
            orderNo: result.obj?.orderNo || 'FAILED-' + paymentOrderNo,
            status: 'FAILED'
          },
        });
      } catch (dbError) {
        console.error('Error updating order status after API failure:', dbError);
        return NextResponse.json({ 
          success: false,
          error: result.errorMsg || 'Failed to create order with provider',
          dbError: 'Failed to update order status'
        }, { status: 500 });
      }
      
      return NextResponse.json({ 
        success: false,
        error: result.errorMsg || 'Failed to create order with provider'
      }, { status: 500 });
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
        }),
      ]);

      return NextResponse.json({ 
        success: true, 
        obj: result.obj
      });
    } catch (dbError) {
      console.error('Error updating order after successful API call:', dbError);
      return NextResponse.json({ 
        success: false,
        error: 'Failed to update order in database',
        apiSuccess: true // Indicate that API call was successful
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Error in createesimorder:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to create eSIM order' 
    }, { status: 500 });
  }
}