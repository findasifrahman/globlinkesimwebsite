const crypto = require('crypto');
const config = require('./config');
const { PrismaClient } = require('@prisma/client');
const { sendEmail } = require('./utils/email');
require('dotenv').config({ path: '../.env.local' });

// Initialize Prisma client with the main project's database URL
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

// Verify webhook signature
function verifySignature(payload, signature) {
  const hmac = crypto.createHmac('sha256', process.env.ESIM_WEBHOOK_SECRET);
  const calculatedSignature = hmac.update(payload).digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(calculatedSignature)
  );
}

// Process order status webhook
async function handleOrderStatus(content) {
  const { orderNo, orderStatus } = content;
  
  try {
    console.log(`[handleOrderStatus] Processing ORDER_STATUS event for order: ${orderNo}`);
    console.log(`[handleOrderStatus] New status: ${orderStatus}`);
    
    // Find the order
    const order = await prisma.order.findUnique({
      where: { orderNo },
      include: { user: true }
    });

    if (!order) {
      console.error(`[handleOrderStatus] Order not found: ${orderNo}`);
      throw new Error(`Order not found: ${orderNo}`);
    }
    console.log(`[handleOrderStatus] Found order: ${order.orderNo}, current status: ${order.status}`);

    // Update order status
    await prisma.order.update({
      where: { orderNo },
      data: {
        status: orderStatus,
        updatedAt: new Date()
      }
    });
    console.log(`[handleOrderStatus] Successfully updated order status to: ${orderStatus}`);

    // If order is ready for download or has got resource, query eSIM profile
    if (orderStatus === 'READY_FOR_DOWNLOAD' || orderStatus === 'GOT_RESOURCE') {
      console.log(`[handleOrderStatus] Order status is ${orderStatus}, proceeding to query eSIM profile`);
      try {
        // Query eSIM profile from Redtea Mobile API
        const esimProfile = await queryEsimProfile(orderNo);
        console.log(`[handleOrderStatus] Successfully retrieved eSIM profile for order: ${orderNo}`);
        
        // Update order with QR code and profile details
        console.log(`[handleOrderStatus] Updating order with eSIM profile details`);
        await prisma.order.update({
          where: { orderNo },
          data: {
            qrCode: esimProfile.qrCode,
            status: orderStatus === 'GOT_RESOURCE' ? 'GOT_RESOURCE' : 'COMPLETED',
            iccid: esimProfile.iccid,
            eid: esimProfile.eid,
            smdpStatus: esimProfile.smdpStatus,
            esimStatus: esimProfile.esimStatus,
            dataRemaining: esimProfile.dataRemaining,
            dataUsed: esimProfile.dataUsed,
            expiryDate: esimProfile.expiryDate ? new Date(esimProfile.expiryDate) : null,
            daysRemaining: esimProfile.daysRemaining,
            updatedAt: new Date()
          }
        });
        console.log(`[handleOrderStatus] Successfully updated order with eSIM profile details`);

        // Send email to user only when status is READY_FOR_DOWNLOAD
        if (orderStatus === 'READY_FOR_DOWNLOAD' && order.user?.email) {
          console.log(`[handleOrderStatus] Sending email notification to user: ${order.user.email}`);
          await sendEmail({
            to: order.user.email,
            subject: 'Your eSIM is ready for download',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Your eSIM is Ready!</h2>
                <p>Your eSIM order ${orderNo} is ready for download. Please check your account.</p>
                <p>If you have any questions, please contact our support team.</p>
              </div>
            `
          });
          console.log(`[handleOrderStatus] Successfully sent email notification to: ${order.user.email}`);
        } else {
          console.log(`[handleOrderStatus] Skipping email notification - status: ${orderStatus}, user email: ${order.user?.email || 'not available'}`);
        }
      } catch (error) {
        console.error(`[handleOrderStatus] Failed to process ${orderStatus} status:`, error);
        throw error;
      }
    } else {
      console.log(`[handleOrderStatus] Order status ${orderStatus} does not require eSIM profile query`);
    }

    return { success: true, orderNo };
  } catch (error) {
    console.error('[handleOrderStatus] Error processing order status:', error);
    throw error;
  }
}

// Process eSIM status webhook
async function handleEsimStatus(content) {
  const { orderNo, esimStatus, smdpStatus, iccid } = content;
  
  try {
    console.log(`[handleEsimStatus] Processing ESIM_STATUS event for order: ${orderNo}`);
    console.log(`[handleEsimStatus] New eSIM status: ${esimStatus}, SMDP status: ${smdpStatus}`);
    
    // Update order with eSIM status
    await prisma.order.update({
      where: { orderNo },
      data: {
        esimStatus,
        smdpStatus,
        iccid: iccid || undefined,
        updatedAt: new Date()
      }
    });
    console.log(`[handleEsimStatus] Successfully updated eSIM status for order: ${orderNo}`);

    return { success: true, orderNo };
  } catch (error) {
    console.error('[handleEsimStatus] Error processing eSIM status:', error);
    throw error;
  }
}

// Process data usage webhook
async function handleDataUsage(content) {
  const { orderNo, remainingVolume, usedVolume } = content;
  
  try {
    console.log(`[handleDataUsage] Processing DATA_USAGE event for order: ${orderNo}`);
    console.log(`[handleDataUsage] Data remaining: ${remainingVolume}, Data used: ${usedVolume}`);
    
    // Update order with usage information
    await prisma.order.update({
      where: { orderNo },
      data: {
        dataRemaining: remainingVolume,
        dataUsed: usedVolume,
        updatedAt: new Date()
      }
    });
    console.log(`[handleDataUsage] Successfully updated data usage for order: ${orderNo}`);

    return { success: true, orderNo };
  } catch (error) {
    console.error('[handleDataUsage] Error processing data usage:', error);
    throw error;
  }
}

// Process validity usage webhook
async function handleValidityUsage(content) {
  const { orderNo, expiryDate, remainingValidity } = content;
  
  try {
    console.log(`[handleValidityUsage] Processing VALIDITY_USAGE event for order: ${orderNo}`);
    console.log(`[handleValidityUsage] Expiry date: ${expiryDate}, Days remaining: ${remainingValidity}`);
    
    // Update order with validity information
    await prisma.order.update({
      where: { orderNo },
      data: {
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        daysRemaining: remainingValidity,
        updatedAt: new Date()
      }
    });
    console.log(`[handleValidityUsage] Successfully updated validity usage for order: ${orderNo}`);

    return { success: true, orderNo };
  } catch (error) {
    console.error('[handleValidityUsage] Error processing validity usage:', error);
    throw error;
  }
}

// Query eSIM profile from Redtea Mobile API
async function queryEsimProfile(orderNo) {
  console.log(`[queryEsimProfile] Starting query for order: ${orderNo}`);
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const body = JSON.stringify({ orderNo });
  const signature = generateHmacSignature(body, process.env.ESIM_SECRET_KEY || '');

  console.log(`[queryEsimProfile] Making API request to query eSIM profile`);
  const response = await fetch(`${process.env.REDTEA_API_URL}/api/v1/open/esim/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Access-Key': process.env.REDTEA_ACCESS_KEY || '',
      'X-Timestamp': timestamp,
      'X-Signature': signature,
    },
    body,
  });

  if (!response.ok) {
    console.error(`[queryEsimProfile] API request failed with status: ${response.status}`);
    throw new Error(`Failed to query eSIM profile: ${response.statusText}`);
  }

  const data = await response.json();
  console.log(`[queryEsimProfile] Successfully retrieved eSIM profile for order: ${orderNo}`);
  console.log(`[queryEsimProfile] Profile data:`, JSON.stringify(data, null, 2));
  
  if (!data.data || data.data.length === 0) {
    throw new Error('No eSIM profile data found in response');
  }
  
  return data.data[0];
}

// Generate HMAC signature for Redtea Mobile API
function generateHmacSignature(body, secretKey) {
  const hmac = crypto.createHmac('sha256', secretKey);
  hmac.update(body);
  return hmac.digest('hex');
}

// Main webhook handler
async function handleWebhook(req, res) {
  console.log('==================================================');
  console.log('[Webhook] Received new webhook request at:', new Date().toISOString());
  console.log('[Webhook] Request URL:', req.url);
  console.log('[Webhook] Request method:', req.method);
  console.log('[Webhook] Request headers:', JSON.stringify(req.headers, null, 2));
  
  try {
    const body = JSON.stringify(req.body);
    console.log('[Webhook] Request body:', body);
    
    // Verify webhook signature if provided
    const signature = req.headers['x-redtea-signature'];
    if (signature) {
      console.log('[Webhook] Verifying signature');
      if (!verifySignature(body, signature)) {
        console.error('[Webhook] Invalid signature');
        return res.status(401).json({ error: 'Invalid signature' });
      }
      console.log('[Webhook] Signature verified successfully');
    } else {
      console.log('[Webhook] No signature provided, skipping verification');
    }
    
    // Parse the payload
    const payload = req.body;
    console.log('[Webhook] Parsed payload:', JSON.stringify(payload, null, 2));
    
    // Check if this is a Redtea Mobile webhook payload
    if (!payload.notifyType || !payload.content) {
      console.error('[Webhook] Invalid webhook payload format');
      return res.status(400).json({ error: 'Invalid webhook payload format' });
    }
    
    // Create webhook event record
    console.log(`[Webhook] Creating webhook event record for type: ${payload.notifyType}, orderNo: ${payload.content.orderNo}`);
    const webhookEvent = await prisma.webhookEvent.create({
      data: {
        type: payload.notifyType,
        orderNo: payload.content.orderNo,
        transactionId: payload.content.transactionId,
        payload: payload,
      },
    });
    console.log(`[Webhook] Successfully created webhook event record`);
    
    // Process the webhook event based on notifyType
    let result;
    switch (payload.notifyType) {
      case 'ORDER_STATUS':
        result = await handleOrderStatus(payload.content);
        break;
      case 'ESIM_STATUS':
        result = await handleEsimStatus(payload.content);
        break;
      case 'DATA_USAGE':
        result = await handleDataUsage(payload.content);
        break;
      case 'VALIDITY_USAGE':
        result = await handleValidityUsage(payload.content);
        break;
      default:
        console.warn(`[Webhook] Unhandled webhook event type: ${payload.notifyType}`);
        return res.status(400).json({ error: `Unsupported webhook type: ${payload.notifyType}` });
    }
    
    // Update webhook event status
    await prisma.webhookEvent.update({
      where: { id: webhookEvent.id },
      data: { status: 'COMPLETED' }
    });
    
    console.log(`[Webhook] Successfully processed webhook event`);
    console.log('==================================================');
    return res.status(200).json(result);
  } catch (error) {
    console.error('[Webhook] Error processing webhook:', error);
    console.log('==================================================');
    
    // Update webhook event status if available
    if (req.body.webhookEventId) {
      try {
        await prisma.webhookEvent.update({
          where: { id: req.body.webhookEventId },
          data: { 
            status: 'FAILED',
            error: error.message
          }
        });
      } catch (updateError) {
        console.error('[Webhook] Failed to update webhook event status:', updateError);
      }
    }
    
    return res.status(500).json({ 
      error: 'Failed to process webhook', 
      message: error.message 
    });
  }
}

module.exports = handleWebhook; 