import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';
import { queryEsimProfile } from '@/lib/esim';

// Types for webhook payloads
export type WebhookPayload = {
  notifyType: 'ORDER_STATUS' | 'ESIM_STATUS' | 'DATA_USAGE' | 'VALIDITY_USAGE';
  content: {
    orderNo: string;
    transactionId?: string;
    orderStatus?: string;
    status?: string;
    smdpStatus?: string;
    dataRemaining?: number;
    dataUsed?: number;
    expiryDate?: string;
    daysRemaining?: number;
    totalVolume?: number;
    usedVolume?: number;
    remainingVolume?: number;
    totalValidity?: number;
    usedValidity?: number;
    remainingValidity?: number;
  };
};

/**
 * Process a webhook event from Redtea Mobile
 * @param payload The webhook payload
 * @returns A promise that resolves when the webhook is processed
 */
export async function processWebhookEvent(payload: WebhookPayload) {
  console.log('==================================================');
  console.log('[processWebhookEvent] Starting to process webhook event');
  console.log('[processWebhookEvent] Payload:', JSON.stringify(payload, null, 2));
  
  try {
    // Create webhook event record
    console.log(`[processWebhookEvent] Creating webhook event record for type: ${payload.notifyType}, orderNo: ${payload.content.orderNo}`);
    await prisma.webhookEvent.create({
      data: {
        type: payload.notifyType,
        orderNo: payload.content.orderNo,
        transactionId: payload.content.transactionId,
        payload: payload as any, // Type cast needed as payload is stored as JSON
      },
    });
    console.log(`[processWebhookEvent] Successfully created webhook event record`);

    // Handle different webhook event types
    switch (payload.notifyType) {
      case 'ORDER_STATUS': {
        console.log(`[processWebhookEvent] Processing ORDER_STATUS event for order: ${payload.content.orderNo}`);
        console.log(`[processWebhookEvent] New status: ${payload.content.orderStatus}`);
        
        const order = await prisma.order.findUnique({
          where: { orderNo: payload.content.orderNo },
          include: { user: true },
        });

        if (!order) {
          console.error(`[processWebhookEvent] Order not found: ${payload.content.orderNo}`);
          throw new Error(`Order not found: ${payload.content.orderNo}`);
        }
        console.log(`[processWebhookEvent] Found order: ${order.orderNo}, current status: ${order.status}`);

        // Update both Order and OrderProfile status
        console.log(`[processWebhookEvent] Updating order and profile status to: ${payload.content.orderStatus}`);
        await prisma.$transaction([
          prisma.order.update({
            where: { orderNo: payload.content.orderNo },
            data: {
              status: payload.content.orderStatus,
            },
          }),
          prisma.orderProfile.update({
            where: { orderNo: payload.content.orderNo },
            data: {
              status: payload.content.orderStatus,
            },
          }),
        ]);
        console.log(`[processWebhookEvent] Successfully updated order and profile status`);

        // If order is ready for download or has got resource, query eSIM profile and send email
        if (payload.content.orderStatus === 'READY_FOR_DOWNLOAD' || payload.content.orderStatus === 'GOT_RESOURCE') {
          console.log(`[processWebhookEvent] Order status is ${payload.content.orderStatus}, proceeding to query eSIM profile`);
          try {
            const esimProfile = await queryEsimProfile(payload.content.orderNo);
            console.log(`[processWebhookEvent] Successfully retrieved eSIM profile for order: ${payload.content.orderNo}`);
            
            // Update order with QR code and profile details
            console.log(`[processWebhookEvent] Updating order with eSIM profile details`);
            await prisma.$transaction([
              prisma.order.update({
                where: { orderNo: payload.content.orderNo },
                data: {
                  qrCode: esimProfile.qrCode,
                  status: payload.content.orderStatus === 'GOT_RESOURCE' ? 'GOT_RESOURCE' : 'COMPLETED',
                  iccid: esimProfile.iccid,
                  eid: esimProfile.eid,
                  smdpStatus: esimProfile.smdpStatus,
                  esimStatus: esimProfile.esimStatus,
                  dataRemaining: esimProfile.dataRemaining,
                  dataUsed: esimProfile.dataUsed,
                  expiryDate: esimProfile.expiryDate ? new Date(esimProfile.expiryDate) : null,
                  daysRemaining: esimProfile.daysRemaining,
                },
              }),
              prisma.orderProfile.update({
                where: { orderNo: payload.content.orderNo },
                data: {
                  status: payload.content.orderStatus === 'GOT_RESOURCE' ? 'GOT_RESOURCE' : 'COMPLETED',
                },
              }),
            ]);
            console.log(`[processWebhookEvent] Successfully updated order with eSIM profile details`);

            // Send email to user only when status is READY_FOR_DOWNLOAD
            if (payload.content.orderStatus === 'READY_FOR_DOWNLOAD' && order.user?.email) {
              console.log(`[processWebhookEvent] Sending email notification to user: ${order.user.email}`);
              await sendEmail({
                to: order.user.email,
                subject: 'Your eSIM is ready for download',
                html: `
                  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>Your eSIM is Ready!</h2>
                    <p>Your eSIM order ${payload.content.orderNo} is ready for download. Please check your account.</p>
                    <p>If you have any questions, please contact our support team.</p>
                  </div>
                `,
              });
              console.log(`[processWebhookEvent] Successfully sent email notification to: ${order.user.email}`);
            } else {
              console.log(`[processWebhookEvent] Skipping email notification - status: ${payload.content.orderStatus}, user email: ${order.user?.email || 'not available'}`);
            }
          } catch (error) {
            console.error(`[processWebhookEvent] Failed to process ${payload.content.orderStatus} status:`, error);
            throw error;
          }
        } else {
          console.log(`[processWebhookEvent] Order status ${payload.content.orderStatus} does not require eSIM profile query`);
        }
        break;
      }

      case 'ESIM_STATUS': {
        console.log(`[processWebhookEvent] Processing ESIM_STATUS event for order: ${payload.content.orderNo}`);
        console.log(`[processWebhookEvent] New eSIM status: ${payload.content.status}, SMDP status: ${payload.content.smdpStatus}`);
        
        await prisma.order.update({
          where: { orderNo: payload.content.orderNo },
          data: {
            esimStatus: payload.content.status,
            smdpStatus: payload.content.smdpStatus,
          },
        });
        console.log(`[processWebhookEvent] Successfully updated eSIM status for order: ${payload.content.orderNo}`);
        break;
      }

      case 'DATA_USAGE': {
        console.log(`[processWebhookEvent] Processing DATA_USAGE event for order: ${payload.content.orderNo}`);
        console.log(`[processWebhookEvent] Data remaining: ${payload.content.remainingVolume}, Data used: ${payload.content.usedVolume}`);
        
        await prisma.order.update({
          where: { orderNo: payload.content.orderNo },
          data: {
            dataRemaining: payload.content.remainingVolume,
            dataUsed: payload.content.usedVolume,
          },
        });
        console.log(`[processWebhookEvent] Successfully updated data usage for order: ${payload.content.orderNo}`);
        break;
      }

      case 'VALIDITY_USAGE': {
        console.log(`[processWebhookEvent] Processing VALIDITY_USAGE event for order: ${payload.content.orderNo}`);
        console.log(`[processWebhookEvent] Expiry date: ${payload.content.expiryDate}, Days remaining: ${payload.content.remainingValidity}`);
        
        await prisma.order.update({
          where: { orderNo: payload.content.orderNo },
          data: {
            expiryDate: payload.content.expiryDate ? new Date(payload.content.expiryDate) : null,
            daysRemaining: payload.content.remainingValidity,
          },
        });
        console.log(`[processWebhookEvent] Successfully updated validity usage for order: ${payload.content.orderNo}`);
        break;
      }

      default:
        console.warn(`[processWebhookEvent] Unhandled webhook event type: ${payload.notifyType}`);
    }
    
    console.log(`[processWebhookEvent] Successfully processed webhook event`);
    console.log('==================================================');
  } catch (error) {
    console.error(`[processWebhookEvent] Error processing webhook event:`, error);
    console.log('==================================================');
    throw error;
  }
} 