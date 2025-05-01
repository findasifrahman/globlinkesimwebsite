import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { queryEsimProfile } from '@/lib/esim';
import { sendEsimEmail } from '@/lib/email';

/**
 * Polls the webhook URL for order status updates
 * @param orderNo The order number to poll for
 * @param maxAttempts Maximum number of polling attempts (default: 30)
 * @param intervalMs Polling interval in milliseconds (default: 2000)
 * @returns Promise<boolean> True if GOT_RESOURCE status is found, false otherwise
 */
async function pollOrderStatus(
  orderNo: string,
  maxAttempts: number = 12,
  intervalMs: number = 5000
): Promise<boolean> {
  console.log(`[pollOrderStatus] Starting to poll for order: ${orderNo}`);
  
  const webhookUrl = process.env.WEBHOOK_URL;
  if (!webhookUrl) {
    throw new Error('WEBHOOK_URL environment variable is not set');
  }

  console.log(`[pollOrderStatus] Using webhook URL: ${webhookUrl}`);
  console.log(`[pollOrderStatus] Max attempts: ${maxAttempts}, Interval: ${intervalMs}ms`);

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(`[pollOrderStatus] Attempt ${attempt}/${maxAttempts}`);
      
      // The URL already includes /last-events, so we don't need to append it
      const response = await fetch(webhookUrl);
      console.log(`[pollOrderStatus] Response status: ${response.status}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch events: ${response.statusText}`);
      }

      const responseText = await response.text();
      console.log(`[pollOrderStatus] Raw response: ${responseText}`);
      
      const data = JSON.parse(responseText);
      console.log(`[pollOrderStatus] Parsed response:`, JSON.stringify(data, null, 2));

      // Check if the response has the expected structure
      if (!data.events || !Array.isArray(data.events)) {
        console.log(`[pollOrderStatus] Response does not contain events array:`, data);
        await new Promise(resolve => setTimeout(resolve, intervalMs));
        continue;
      }

      console.log(`[pollOrderStatus] Retrieved ${data.events.length} events`);

      // Look for GOT_RESOURCE status in the events
      const gotResourceEvent = data.events.find((event: any) => 
        event.notifyType === 'ORDER_STATUS' && 
        event.content?.orderNo === orderNo && 
        event.content?.orderStatus === 'GOT_RESOURCE'
      );

      if (gotResourceEvent) {
        console.log(`[pollOrderStatus] Found GOT_RESOURCE status for order: ${orderNo}`);
        console.log(`[pollOrderStatus] Event details:`, JSON.stringify(gotResourceEvent, null, 2));
        
        // Process the order and update the database
        await processOrderAfterGotResource(orderNo);
        
        // Return true to indicate we found the status and processed the order
        return true;
      }

      console.log(`[pollOrderStatus] No matching event found for order: ${orderNo}`);
      // Wait before next attempt
      await new Promise(resolve => setTimeout(resolve, intervalMs));
    } catch (error) {
      console.error(`[pollOrderStatus] Error in attempt ${attempt}:`, error);
      // Continue to next attempt even if there's an error
      await new Promise(resolve => setTimeout(resolve, intervalMs));
    }
  }

  console.log(`[pollOrderStatus] No GOT_RESOURCE status found after ${maxAttempts} attempts`);
  return false;
}

/**
 * Process an order after confirming GOT_RESOURCE status
 * @param orderNo The order number to process
 * @returns Promise<void>
 */
async function processOrderAfterGotResource(orderNo: string): Promise<void> {
  console.log(`[processOrderAfterGotResource] Processing order: ${orderNo}`);
  
  try {
    // First, update the order_profiles table status to GOT_RESOURCE
    console.log(`[processOrderAfterGotResource] Updating order_profiles status to GOT_RESOURCE`);

    //also update the esimOrderBeforePayment table
    await prisma.esimOrderBeforePayment.update({
      where: { orderNo },
      data: {
        status: 'GOT_RESOURCE',
        updatedAt: new Date()
      }
    });
    // Now query the eSIM profile directly
    console.log(`[processOrderAfterGotResource] Querying eSIM profile for order: ${orderNo}`);
    const esimProfile = await queryEsimProfile(orderNo);
    console.log(`[processOrderAfterGotResource] Retrieved eSIM profile:`, esimProfile);
    
    // Get the order profile to find the user
    const orderProfile = await prisma.esimOrderBeforePayment.findUnique({
      where: { orderNo },
      include: { user: true }
    });
    
    if (!orderProfile) {
      throw new Error(`Order profile not found: ${orderNo}`);
    }
    
    // Update the order in the database with the eSIM profile details
    const updatedOrder = await prisma.esimOrderAfterPayment.update({
      where: { orderNo },
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
        updatedAt: new Date()
      }
    });
    
    console.log(`[processOrderAfterGotResource] Updated order with eSIM profile:`, updatedOrder);
    
    // Send email to the user
    if (orderProfile.user?.email) {
      console.log(`[processOrderAfterGotResource] Sending email to: ${orderProfile.user.email}`);
      await sendEsimEmail(
        orderProfile.user.email,
        orderNo,
        esimProfile
      );
      console.log(`[processOrderAfterGotResource] Email sent successfully`);
    } else {
      console.warn(`[processOrderAfterGotResource] No email found for order: ${orderNo}`);
    }
  } catch (error) {
    console.error(`[processOrderAfterGotResource] Error processing order:`, error);
    throw error;
  }
}

/**
 * POST /api/esim/poll-status
 * Polls the webhook URL for order status updates
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { orderNo, maxAttempts, intervalMs } = body;

    if (!orderNo) {
      return NextResponse.json({ error: 'Order number is required' }, { status: 400 });
    }

    console.log(`[POST /api/esim/poll-status] Polling for order status: ${orderNo}`);

    // Poll for order status
    const isReady = await pollOrderStatus(
      orderNo,
      maxAttempts || 30,
      intervalMs || 2000
    );

    return NextResponse.json({
      success: true,
      isReady,
      message: isReady ? 'Order is ready' : 'Order is not ready yet'
    });
  } catch (error) {
    console.error('[POST /api/esim/poll-status] Error:', error);
    return NextResponse.json(
      { error: 'Failed to poll order status', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 