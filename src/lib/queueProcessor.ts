import { prisma } from './prisma';
import { sendCreateEsimFailedEmail } from '@/lib/email';

export type QueueItem = {
  orderNo: string;
  type: string;
  priority?: number;
};

export type QueueError = {
  message: string;
  code?: string;
  details?: any;
};

export class QueueProcessor {
  private static instance: QueueProcessor;
  private isProcessing: boolean = false;
  private readonly MAX_PROCESSING_TIME = 30 * 60 * 1000; // 30 minutes in milliseconds

  private constructor() {}

  static getInstance(): QueueProcessor {
    if (!QueueProcessor.instance) {
      QueueProcessor.instance = new QueueProcessor();
    }
    return QueueProcessor.instance;
  }

  async addToQueue(item: QueueItem): Promise<void> {
    await prisma.processingQueue.create({
      data: {
        orderNo: item.orderNo,
        type: item.type,
        status: 'PENDING',
        priority: item.priority || 0,
        nextAttempt: new Date(),
      },
    });
  }

  async processQueueItems(): Promise<void> {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      // Get items that are ready to be processed
      const items = await prisma.processingQueue.findMany({
        where: {
          status: 'PENDING',
          nextAttempt: {
            lte: new Date(),
          },
          retryCount: {
            lt: 5,
          },
          createdAt: {
            gte: new Date(Date.now() - this.MAX_PROCESSING_TIME),
          },
        },
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'asc' },
        ],
        take: 5,
      });

      for (const item of items) {
        await this.processItem(item);
      }

      // Cleanup old items
      await this.cleanupOldItems();
    } finally {
      this.isProcessing = false;
    }
  }

  private async processItem(item: any): Promise<void> {
    try {
      // Check if item has been processing too long
      if (Date.now() - item.createdAt.getTime() > this.MAX_PROCESSING_TIME) {
        await this.handleTimeout(item);
        return;
      }

      // Mark as processing
      await prisma.processingQueue.update({
        where: { id: item.id },
        data: {
          status: 'PROCESSING',
          lastAttempt: new Date(),
        },
      });

      // Process based on type
      switch (item.type) {
        case 'ESIM_ORDER_PROCESSING':
          await this.processEsimOrder(item);
          break;
        default:
          throw new Error(`Unknown queue item type: ${item.type}`);
      }

      // Mark as completed
      await prisma.processingQueue.update({
        where: { id: item.id },
        data: {
          status: 'COMPLETED',
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      await this.handleError(item, error);
    }
  }

  private async handleError(item: any, error: any): Promise<void> {
    const errorDetails: QueueError = {
      message: error.message,
      code: error.code,
      details: error,
    };

    const retryCount = item.retryCount + 1;
    const nextAttempt = this.calculateNextAttempt(retryCount);
    const isFinalAttempt = retryCount >= item.maxRetries;

    // Get order and user details
    const order = await prisma.esimOrderAfterPayment.findUnique({
      where: { orderNo: item.orderNo },
      include: {
        user: true,
      },
    });

    if (order?.user?.email) {
      if (isFinalAttempt) {
        // Send final failure email with support contact
        await sendCreateEsimFailedEmail(order.user.email, {
          orderNo: item.orderNo,
          error: error.message,
          supportEmail: 'globlinksolution@gmail.com',
          message: 'We were unable to create your eSIM after multiple attempts. Please contact our support team for assistance.',
        });
      } else {
        // Send retry notification
        await sendCreateEsimFailedEmail(order.user.email, {
          orderNo: item.orderNo,
          error: error.message,
          message: `We're still working on creating your eSIM. Please wait 5-30 minutes. If you don't receive your eSIM by then, please contact our support team at globlinksolution@gmail.com`,
        });
      }
    }

    await prisma.processingQueue.update({
      where: { id: item.id },
      data: {
        status: isFinalAttempt ? 'FAILED' : 'PENDING',
        error: error.message,
        errorDetails: errorDetails,
        retryCount,
        nextAttempt,
        updatedAt: new Date(),
      },
    });

    if (isFinalAttempt) {
      await prisma.esimOrderAfterPayment.update({
        where: { orderNo: item.orderNo },
        data: {
          status: 'FAILED',
        },
      });
    }
  }

  private async handleTimeout(item: any): Promise<void> {
    // Get order details for email
    const order = await prisma.esimOrderAfterPayment.findUnique({
      where: { orderNo: item.orderNo },
      include: {
        user: true,
      },
    });

    if (order?.user?.email) {
      await sendCreateEsimFailedEmail(order.user.email, {
        orderNo: item.orderNo,
        error: 'E-SIM creation timed out after 30 minutes',
        supportEmail: 'globlinksolution@gmail.com',
        message: 'We were unable to create your eSIM within the expected time. Please contact our support team for assistance.',
      });
    }

    // Mark as failed
    await prisma.processingQueue.update({
      where: { id: item.id },
      data: {
        status: 'FAILED',
        error: 'Processing timeout after 30 minutes',
        errorDetails: {
          message: 'Processing timeout after 30 minutes',
          code: 'TIMEOUT',
        },
        updatedAt: new Date(),
      },
    });

    // Update order status
    await prisma.esimOrderAfterPayment.update({
      where: { orderNo: item.orderNo },
      data: {
        status: 'FAILED',
      },
    });
  }

  private async cleanupOldItems(): Promise<void> {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    await prisma.processingQueue.deleteMany({
      where: {
        OR: [
          { status: 'COMPLETED' },
          { status: 'FAILED' },
        ],
        updatedAt: {
          lt: thirtyDaysAgo,
        },
      },
    });
  }

  private calculateNextAttempt(retryCount: number): Date {
    // Exponential backoff: 1min, 2min, 4min, 8min, 16min
    const delayMinutes = Math.pow(2, retryCount - 1);
    return new Date(Date.now() + delayMinutes * 60 * 1000);
  }

  private async processEsimOrder(item: any): Promise<void> {
    // Get the order details
    const order = await prisma.esimOrderAfterPayment.findUnique({
      where: { orderNo: item.orderNo },
      include: {
        package: true,
      },
    });

    if (!order) {
      throw new Error(`Order ${item.orderNo} not found`);
    }

    // Check if order is already processed
    if (order.status === 'COMPLETED') {
      return;
    }

    // Update order status to processing
    await prisma.esimOrderAfterPayment.update({
      where: { orderNo: item.orderNo },
      data: {
        status: 'PROCESSING',
      },
    });

    try {
      // TODO: Add your eSIM creation logic here
      // This is where you'll integrate with your eSIM provider's API
      // For now, we'll just simulate a successful creation
      
      // Update order status to completed
      await prisma.esimOrderAfterPayment.update({
        where: { orderNo: item.orderNo },
        data: {
          status: 'COMPLETED',
          esimStatus: 'UNUSED_EXPIRED',
          smdpStatus: 'ENABLED',
        },
      });
    } catch (error) {
      // If eSIM creation fails, update order status
      await prisma.esimOrderAfterPayment.update({
        where: { orderNo: item.orderNo },
        data: {
          status: 'FAILED',
        },
      });
      throw error; // Re-throw to trigger queue retry mechanism
    }
  }
} 