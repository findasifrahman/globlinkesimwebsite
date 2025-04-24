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
  // Prevent test orders in production
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Test orders are not allowed in production' },
      { status: 403 }
    );
  }

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
      amount: testPackage.price,
      packageInfoList: [{
        packageCode: testPackage.packageCode,
        count: 1,
        price: testPackage.price
      }]
    };

    // Generate signature
    const signature = generateHmacSignature(
      timestamp,
      transactionId,
      REDTEA_ACCESS_CODE!,
      JSON.stringify(orderData),
      REDTEA_SECRET_KEY!
    );

    // Make the API request
    const response = await fetch(REDTEA_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'RT-AccessCode': REDTEA_ACCESS_CODE!,
        'RT-Timestamp': timestamp,
        'RT-Signature': signature
      },
      body: JSON.stringify(orderData)
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in test order:', error);
    return NextResponse.json(
      { error: 'Failed to process test order' },
      { status: 500 }
    );
  }
} 