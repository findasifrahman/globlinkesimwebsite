import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
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

export async function GET() {
  try {
    // Get a test package from the database
    const testPackage = await prisma.allPackage.findFirst();
    
    if (!testPackage) {
      return NextResponse.json(
        { error: 'No packages found in database' },
        { status: 404 }
      );
    }
    
    // Generate a unique transaction ID
    const transactionId = `TEST-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Generate timestamp
    const timestamp = Math.floor(Date.now() / 1000).toString();
    
    // Prepare the request to Redtea Mobile
    const orderData = {
      transactionId,
      amount: testPackage.price, // Use price directly from database
      packageInfoList: [{
        packageCode: testPackage.packageCode,
        count: 1,
        price: testPackage.price // Use price directly from database
      }]
    };
    
    // Convert order data to string for signature
    const requestBody = JSON.stringify(orderData);
    
    // Generate signature
    const signature = generateHmacSignature(
      timestamp,
      transactionId,
      REDTEA_ACCESS_CODE!,
      requestBody,
      REDTEA_SECRET_KEY!
    );

    // Log the request details for debugging
    console.log('Request details:', {
      url: REDTEA_API_URL,
      headers: {
        'Content-Type': 'application/json',
        'RT-AccessCode': REDTEA_ACCESS_CODE,
        'RT-Timestamp': timestamp,
        'RT-Signature': signature
      },
      body: orderData
    });

    // Make request to Redtea Mobile API
    const response = await fetch(REDTEA_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'RT-AccessCode': REDTEA_ACCESS_CODE!,
        'RT-Timestamp': timestamp,
        'RT-Signature': signature
      },
      body: requestBody
    });

    const responseText = await response.text();
    console.log('Response text:', responseText);
    
    let result;
    try {
      result = JSON.parse(responseText);
    } catch (e) {
      console.error('Failed to parse response as JSON:', e);
      return NextResponse.json(
        { error: 'Invalid JSON response from API', responseText },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      request: {
        url: REDTEA_API_URL,
        headers: {
          'Content-Type': 'application/json',
          'RT-AccessCode': REDTEA_ACCESS_CODE,
          'RT-Timestamp': timestamp,
          'RT-Signature': signature
        },
        body: orderData
      },
      response: result
    });

  } catch (error) {
    console.error('Error testing order creation:', error);
    return NextResponse.json(
      { error: 'Failed to test order creation' },
      { status: 500 }
    );
  }
} 