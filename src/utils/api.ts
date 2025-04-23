import { v4 as uuidv4 } from 'uuid';
import { ProcessedPackage } from '@/types/package';

interface OrderResponse {
  orderNo: string;
  transactionId: string;
  status: string;
  message: string;
}

export async function createOrder(
  packageData: ProcessedPackage,
  quantity: number,
  userId: string
): Promise<OrderResponse> {
  const transactionId = uuidv4();
  const timestamp = Math.floor(Date.now() / 1000);
  const payload = {
    transactionId,
    packageCode: packageData.packageCode,
    count: quantity,
    price: packageData.price,
    periodNum: packageData.duration,
  };

  const response = await fetch('https://api.esimaccess.com/api/v1/open/esim/order', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': process.env.NEXT_PUBLIC_ESIM_API_KEY || '',
      'X-Timestamp': timestamp.toString(),
      'X-Signature': generateSignature(payload, timestamp),
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error('Failed to create order');
  }

  const data = await response.json();
  
  // Save order to database
  await saveOrderToDatabase({
    userId,
    transactionId,
    packageCode: packageData.packageCode,
    count: quantity,
    price: packageData.price,
    periodNum: packageData.duration,
    orderNo: data.orderNo,
  });

  return {
    orderNo: data.orderNo,
    transactionId,
    status: data.status,
    message: data.message,
  };
}

async function saveOrderToDatabase(orderData: {
  userId: string;
  transactionId: string;
  packageCode: string;
  count: number;
  price: number;
  periodNum: number;
  orderNo: string;
}) {
  const response = await fetch('/api/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(orderData),
  });

  if (!response.ok) {
    throw new Error('Failed to save order to database');
  }

  return response.json();
}

function generateSignature(payload: any, timestamp: number): string {
  const message = `${JSON.stringify(payload)}${timestamp}`;
  const key = process.env.NEXT_PUBLIC_ESIM_API_SECRET || '';
  
  // Use the crypto API to generate HMAC
  const encoder = new TextEncoder();
  const keyData = encoder.encode(key);
  const messageData = encoder.encode(message);
  
  return crypto.subtle.sign(
    'HMAC',
    keyData,
    messageData
  ).then(signature => {
    return btoa(String.fromCharCode(...new Uint8Array(signature)));
  });
} 