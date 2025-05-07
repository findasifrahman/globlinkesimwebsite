import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { sendCreateEsimFailedEmail, sendEsimEmail } from '@/lib/email';
import { queryEsimProfile } from '@/lib/esim';
import { createesimorder } from '@/app/api/process-order/[orderId]/route';
import { EsimProfile } from '@/types/esim';

interface QueueItem {
  id: string;
  orderNo: string;
  type: string;
  status: string;
  error?: string | null;
  errorDetails?: Prisma.JsonValue;
  retryCount: number;
  lastAttempt?: Date | null;
  nextAttempt?: Date | null;
  maxRetries: number;
  priority: number;
  createdAt: Date;
  updatedAt: Date;
}

interface QueueError {
  message: string;
  code?: string;
}

export class QueueProcessor {
  private static instance: QueueProcessor;
  private isProcessing: boolean = false;
  private processingInterval: NodeJS.Timeout | null = null;

  private constructor() {}

  public static getInstance(): QueueProcessor {
    if (!QueueProcessor.instance) {
      QueueProcessor.instance = new QueueProcessor();
    }
    return QueueProcessor.instance;
  }

  public async addToQueue(type: string, orderNo: string): Promise<void> {
    await prisma.processingQueue.create({
      data: {
        type,
        orderNo,
        status: 'PENDING',
        retryCount: 0,
        lastAttempt: null,
        nextAttempt: new Date(),
        maxRetries: 2,
        priority: 0,
        error: null,
        errorDetails: Prisma.JsonNull
      },
    });
  }

  public async startProcessing(): Promise<void> {
    if (this.isProcessing) {
      console.log('Queue processing is already in progress');
      return;
    }

    this.isProcessing = true;
    console.log('Starting queue processing...');

    try {
      // Get pending queue items
      const pendingItems = await prisma.processingQueue.findMany({
        where: {
          status: 'PENDING',
          OR: [
            { nextAttempt: { lte: new Date() } },
            { nextAttempt: null }
          ],
          retryCount: { lt: 2 } // Max 2 retries
        },
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'asc' }
        ]
      });

      console.log(`Found ${pendingItems.length} pending items to process`);

      // Process each item
      for (const item of pendingItems) {
        try {
          await this.processEsimOrder(item);
        } catch (error) {
          console.error(`Error processing item ${item.id}:`, error);
          // Update item status to RETRY
          await prisma.processingQueue.update({
            where: { id: item.id },
            data: {
              status: 'RETRY',
              retryCount: { increment: 1 },
              lastAttempt: new Date(),
              nextAttempt: new Date(Date.now() + 5 * 60 * 1000), // Retry after 5 minutes
              error: error instanceof Error ? error.message : 'Unknown error',
              errorDetails: error
            }
          });
        }
      }
    } catch (error) {
      console.error('Error in queue processing:', error);
      throw error;
    } finally {
      this.isProcessing = false;
      console.log('Queue processing completed');
    }
  }

  public async processEsimOrder(item: QueueItem): Promise<void> {
    try {
      console.log("Processing esim order in the queue processor.......");
      // Fetch order details
      const order = await prisma.esimOrderAfterPayment.findUnique({
        where: { orderNo: item.orderNo },
        include: {
          package: true,
          user: true
        }
      });

      if (!order) {
        throw new Error('Order not found');
      }

      if (order.status === 'COMPLETED') {
        console.log('Order already completed:', order.orderNo);
        return;
      }

      // Update order status to processing
      await prisma.esimOrderAfterPayment.update({
        where: { orderNo: order.orderNo },
        data: { status: 'PROCESSING' }
      });

      // Create eSIM order
      const response = await createesimorder(
        order.packageCode,
        1,
        order.finalAmountPaid || 0,
        order.transactionId || '',
        order.paymentOrderNo || order.orderNo
      );

      if (!response.ok) {
        throw new Error('Failed to create eSIM order');
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to create eSIM order');
      }

      // Update order with new order number
      await prisma.esimOrderAfterPayment.update({
        where: { orderNo: order.orderNo },
        data: {
          orderNo: result.obj.orderNo,
          status: 'PROCESSING'
        }
      });

      // Update queue item status
      await prisma.processingQueue.update({
        where: { id: item.id },
        data: {
          status: 'COMPLETED',
          updatedAt: new Date()
        }
      });

    } catch (error) {
      console.error('Error processing eSIM order:', error);
      throw error;
    }
  }

  public stopProcessing(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }
    this.isProcessing = false;
  }
} 