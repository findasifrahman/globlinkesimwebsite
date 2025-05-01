import { EsimProfile } from '@/types/esim';
import crypto from 'crypto';

/**
 * Queries the eSIM API for profile details
 * @param orderNo The order number to query
 * @returns Promise containing the eSIM profile details
 */
export async function queryEsimProfile(esimOrderNo: string): Promise<EsimProfile | null> {
  console.log(`[${new Date().toISOString()}] Querying eSIM profile for order: ${esimOrderNo}`);
  
  const requestBody = {
    orderNo: esimOrderNo,
    iccid: "",
    pager: {
      pageNum: 1,
      pageSize: 20
    }
  };

  const timestamp = Date.now().toString();
  const nonce = crypto.randomBytes(16).toString('hex');
  const secretKey = process.env.NEXT_PUBLIC_REDTEA_SECRET_KEY || process.env.REDTEA_SECRET_KEY;
  const accessCode = process.env.NEXT_PUBLIC_REDTEA_ACCESS_KEY || process.env.REDTEA_ACCESS_KEY;

  if (!secretKey) {
    throw new Error('REDTEA_SECRET_KEY is not configured');
  }

  if (!accessCode) {
    throw new Error('REDTEA_ACCESS_KEY is not configured');
  }

  const signature = generateHmacSignature(JSON.stringify(requestBody), secretKey);

  const response = await fetch('https://api.esimaccess.com/api/v1/open/esim/query', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Timestamp': timestamp,
      'X-Nonce': nonce,
      'X-Signature': signature,
      'RT-AccessCode': accessCode
    },
    body: JSON.stringify(requestBody)
  });

  console.log(`[queryEsimProfile] Response status: ${response.status}`);
  
  if (!response.ok) {
    console.error(`Failed to query eSIM profile: ${response.statusText}`);
    return null;
  }

  const data = await response.json();
  console.log(`[queryEsimProfile] API response:`, JSON.stringify(data, null, 2));
  
  if (!data.success || !data.obj || !data.obj.esimList || data.obj.esimList.length === 0) {
    console.log(`No eSIM profile found for order ${esimOrderNo}`);
    return null;
  }

  const profile = data.obj.esimList[0];
  
  return {
    qrCode: profile.qrCodeUrl,
    iccid: profile.iccid,
    eid: profile.eid || '',
    smdpStatus: profile.smdpStatus,
    esimStatus: profile.esimStatus,
    dataRemaining: profile.totalVolume - (profile.orderUsage || 0),
    dataUsed: profile.orderUsage || 0,
    expiryDate: profile.expiredTime,
    daysRemaining: profile.totalDuration
  };
}

/**
 * Generates an HMAC signature for API authentication
 * @param body The request body to sign
 * @param secretKey The secret key to use for signing
 * @returns The generated HMAC signature
 */
function generateHmacSignature(body: string, secretKey: string): string {
  return crypto
    .createHmac('sha256', secretKey)
    .update(body)
    .digest('hex');
}

/**
 * Polls the Railway webhook service for order status updates
 * @param orderNo The order number to poll for
 * @param maxAttempts Maximum number of polling attempts (default: 30)
 * @param intervalMs Polling interval in milliseconds (default: 2000)
 * @returns Promise<boolean> True if GOT_RESOURCE status is found, false otherwise
 */
export async function pollForOrderStatus(
  orderNo: string,
  paymentOrderNo: string,
  transactionId: string,
  maxAttempts: number = 12,
  intervalMs: number = 5000
): Promise<{ webhook_esimProfile: any }>  {
  console.log(`[pollForOrderStatus] Starting to poll for payment order in webhook table: ${orderNo}`);
  
  const webhookUrl = process.env.WEBHOOK_URL;
  if (!webhookUrl) {
    throw new Error('WEBHOOK_URL environment variable is not set');
  }

  console.log(`[pollForOrderStatus] Using webhook URL: ${webhookUrl}`);
  console.log(`[pollForOrderStatus] Max attempts: ${maxAttempts}, Interval: ${intervalMs}ms`);

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(`[pollForOrderStatus] Attempt ${attempt}/${maxAttempts}`);
      
      // The URL already includes /last-events, so we don't need to append it
      const response = await fetch(webhookUrl);
      console.log(`[pollForOrderStatus] Response status: ${response.status}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch events: ${response.statusText}`);
      }

      const responseText = await response.text();
      //console.log(`[pollForOrderStatus] Raw response: ${responseText}`);
      
      const data = JSON.parse(responseText);
      //console.log(`[pollForOrderStatus] Parsed response:`, JSON.stringify(data, null, 2));

      // Check if the response has the expected structure
      if (!data.events || !Array.isArray(data.events)) {
        console.log(`[pollForOrderStatus] Response does not contain events array:`, data);
        await new Promise(resolve => setTimeout(resolve, intervalMs));
        continue;
      }

      console.log(`[pollForOrderStatus] Retrieved ${data.events.length} events`);

      // Look for GOT_RESOURCE status in the events
      // transactionId is same for both esim and paymentn so we can use it to find the event
      const gotResourceEvent = data.events.find((event: any) => 
        event.notifyType === 'ORDER_STATUS' && 
        event.content?.transactionId === transactionId && 
        event.content?.orderStatus === 'GOT_RESOURCE'
      );

      if (gotResourceEvent) {
        console.log(`[pollForOrderStatus] Found GOT_RESOURCE status for order: ${orderNo} and transactionId: ${transactionId}`);
        console.log(`[pollForOrderStatus] Event details:`, JSON.stringify(gotResourceEvent, null, 2));
        return { webhook_esimProfile: gotResourceEvent };
      }

      console.log(`[pollForOrderStatus] No matching event found for order: ${orderNo}`);
      // Wait before next attempt
      await new Promise(resolve => setTimeout(resolve, intervalMs));
    } catch (error) {
      console.error(`[pollForOrderStatus] Error in attempt ${attempt}:`, error);
      // Continue to next attempt even if there's an error
      await new Promise(resolve => setTimeout(resolve, intervalMs));
    }
  }

  console.log(`[pollForOrderStatus] No GOT_RESOURCE status found after ${maxAttempts} attempts`);
  return { webhook_esimProfile: null };
}

/**
 * Processes an order after confirming GOT_RESOURCE status
 * @param orderNo The order number to process
 * @returns Promise<{ esimProfile: EsimProfile }>
 */
export async function processOrderAfterGotResource(orderNo: string): Promise<{ esimProfile: EsimProfile }> {
  console.log(`[processOrderAfterGotResource] Processing order: ${orderNo}`);
  
  // Query the eSIM profile
  const esimProfile = await queryEsimProfile(orderNo);
  
  return { esimProfile };
} 