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
        maxRetries: 5,
        priority: 0,
        error: null,
        errorDetails: Prisma.JsonNull
      },
    });
  }

  public async processEsimOrder(item: QueueItem): Promise<void> {
    try {
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

      // Poll for order status
      const esimProfile = await this.pollForOrderStatus(result.obj.orderNo);
      if (!esimProfile) {
        throw new Error('Failed to get eSIM profile');
      }

      // Update order with eSIM details
      await prisma.esimOrderAfterPayment.update({
        where: { orderNo: result.obj.orderNo },
        data: {
          status: 'COMPLETED',
          esimStatus: esimProfile.esimStatus,
          smdpStatus: esimProfile.smdpStatus,
          dataRemaining: esimProfile.dataRemaining,
          dataUsed: esimProfile.dataUsed,
          expiryDate: esimProfile.expiryDate ? new Date(esimProfile.expiryDate) : null,
          daysRemaining: esimProfile.daysRemaining,
          qrCode: esimProfile.qrCode,
          iccid: esimProfile.iccid
        }
      });

      // Send email with eSIM details
      if (order.user?.email) {
        await sendEsimEmail(
          order.user.email,
          result.obj.orderNo,
          {
            ...esimProfile,
            packageCode: order.packageCode,
            amount: order.finalAmountPaid || 0,
            currency: order.currency || 'USD',
            discountCode: order.discountCode || undefined
          }
        );
      }

      // Mark queue item as completed
      await prisma.processingQueue.update({
        where: { id: item.id },
        data: {
          status: 'COMPLETED',
          updatedAt: new Date()
        }
      });

    } catch (error) {
      console.error('Error processing eSIM order:', error);
      
      // Update order status to failed
      await prisma.esimOrderAfterPayment.update({
        where: { orderNo: item.orderNo },
        data: {
          status: 'FAILED',
          smdpStatus: error instanceof Error ? error.message : 'Unknown error'
        }
      });

      // Send failure email
      const order = await prisma.esimOrderAfterPayment.findUnique({
        where: { orderNo: item.orderNo },
        include: { user: true }
      });

      if (order?.user?.email) {
        await sendCreateEsimFailedEmail(
          order.user.email,
          item.orderNo
        );
      }

      // Update queue item with error
      await prisma.processingQueue.update({
        where: { id: item.id },
        data: {
          status: 'FAILED',
          error: error instanceof Error ? error.message : 'Unknown error',
          errorDetails: error,
          lastAttempt: new Date(),
          updatedAt: new Date()
        }
      });

      throw error;
    }
  }

  private async pollForOrderStatus(orderNo: string): Promise<EsimProfile | null> {
    const MAX_ATTEMPTS = 30;
    const POLL_INTERVAL = 2000; // 2 seconds

    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      try {
        const profile = await queryEsimProfile(orderNo);
        if (profile && profile.esimStatus === 'ACTIVE') {
          return profile;
        }
        await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL));
      } catch (error) {
        console.error('Error polling for order status:', error);
        if (attempt === MAX_ATTEMPTS - 1) {
          throw error;
        }
      }
    }

    return null;
  }

  public async startProcessing(): Promise<void> {
    if (this.isProcessing) {
      return;
    }

    this.isProcessing = true;
    this.processingInterval = setInterval(async () => {
      try {
        const item = await prisma.processingQueue.findFirst({
          where: {
            status: 'PENDING',
            nextAttempt: {
              lte: new Date()
            }
          },
          orderBy: {
            createdAt: 'asc'
          }
        });

        if (!item) {
          return;
        }

        switch (item.type) {
          case 'ESIM_ORDER_PROCESSING':
            await this.processEsimOrder(item);
            break;
          default:
            console.warn('Unknown queue item type:', item.type);
        }
      } catch (error) {
        console.error('Error processing queue item:', error);
      }
    }, 5000); // Check every 5 seconds
  }

  public stopProcessing(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }
    this.isProcessing = false;
  }
} 