import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Mark this route as dynamic
export const dynamic = 'force-dynamic';

// This endpoint is designed to be called by a cron job or scheduled task
export async function GET(req: Request) {
  try {
    // Find all pending payments that are older than 1 minute
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
    
    const pendingPayments = await prisma.paymentWebhookState.findMany({
      where: {
        status: 'completed',
        updatedAt: {
          lt: oneMinuteAgo
        }
      }
    });

    console.log(`Found ${pendingPayments.length} completed payments to process`);

    const results = [];

    for (const payment of pendingPayments) {
      try {
        // Check if order already exists
        const existingOrder = await prisma.order.findFirst({
          where: {
            orderNo: payment.orderId
          }
        });

        if (existingOrder) {
          console.log(`Order ${payment.orderId} already exists, skipping`);
          continue;
        }

        // Get package details
        const packageDetails = await prisma.allPackage.findUnique({
          where: {
            packageCode: payment.orderId.split('-')[0] // Assuming orderId format is packageCode-timestamp
          }
        });

        if (!packageDetails) {
          console.error(`Package not found for order ${payment.orderId}`);
          continue;
        }

        // Create order record
        const order = await prisma.order.create({
          data: {
            orderNo: payment.orderId,
            userId: payment.userId,
            packageCode: packageDetails.packageCode,
            status: 'PROCESSING',
            createdAt: new Date(),
            updatedAt: new Date()
          }
        });

        // Update payment status to indicate processing
        await prisma.paymentWebhookState.update({
          where: {
            id: payment.id
          },
          data: {
            status: 'processing'
          }
        });

        // Here you would call your eSIM generation API
        // For now, we'll just simulate it with a delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Update order status to indicate it's ready for download
        await prisma.order.update({
          where: {
            id: order.id
          },
          data: {
            status: 'READY_FOR_DOWNLOAD',
            updatedAt: new Date()
          }
        });

        results.push({
          orderId: payment.orderId,
          status: 'processed'
        });
      } catch (error) {
        console.error(`Error processing payment ${payment.orderId}:`, error);
        results.push({
          orderId: payment.orderId,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return NextResponse.json({
      processed: results.length,
      results
    });
  } catch (error) {
    console.error('Error processing payments:', error);
    return NextResponse.json(
      { error: 'Failed to process payments' },
      { status: 500 }
    );
  }
} 