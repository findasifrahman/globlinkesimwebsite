import { NextResponse } from 'next/server';
import crypto from 'crypto';

const REDTEA_API_URL = 'https://api.esimaccess.com/api/v1/open/package/list';
const REDTEA_ACCESS_CODE = process.env.ESIM_ACCESS_CODE;
const REDTEA_SECRET_KEY = process.env.ESIM_SECRET_KEY;

// Function to generate HMAC signature
function generateHmacSignature(timestamp: string, requestId: string, accessCode: string, requestBody: string, secretKey: string): string {
    const dataToSign = timestamp + requestId + accessCode + requestBody;
    const hmac = crypto.createHmac('sha256', secretKey);
    hmac.update(dataToSign);
    return hmac.digest('hex').toLowerCase();
}

export async function POST(request: Request) {
    try {
        const { packageCode } = await request.json();

        if (!packageCode) {
            return NextResponse.json({ 
                success: false, 
                error: 'Package code is required' 
            }, { status: 400 });
        }

        // Check if environment variables are set
        if (!REDTEA_ACCESS_CODE || !REDTEA_SECRET_KEY) {
            return NextResponse.json({ 
                success: false, 
                error: 'Server configuration error' 
            }, { status: 500 });
        }

        // Generate timestamp and request ID
        const timestamp = Math.floor(Date.now() / 1000).toString();
        const requestId = crypto.randomUUID();

        // Prepare request body
        const requestBody = JSON.stringify({
            locationCode: "",
            type: "",
            slug: "",
            packageCode: packageCode,
            iccid: ""
        });

        // Generate signature
        const signature = generateHmacSignature(
            timestamp,
            requestId,
            REDTEA_ACCESS_CODE,
            requestBody,
            REDTEA_SECRET_KEY
        );

        // Make request to Redtea Mobile API
        const response = await fetch(REDTEA_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Timestamp': timestamp,
                'RT-AccessCode': REDTEA_ACCESS_CODE,
                'X-Signature': signature
            },
            body: requestBody
        });
  
        const result = await response.json();

        console.log("response from getEsimPackageByCode to get price by package code--");
        console.log("response from getEsimPackageByCode to get price by package code--", result);
        console.log("response from getEsimPackageByCode to get price by package code--");
        if (!response.ok || !result.success) {
            return NextResponse.json({ 
                success: false, 
                error: result.errorMsg || 'Failed to fetch package details' 
            }, { status: 500 });
        }

        // Return the package details
        return NextResponse.json({ 
            success: true, 
            package: result.obj.packageList[0] 
        });

    } catch (error) {
        console.error('Error fetching package details:', error);
        return NextResponse.json({ 
            success: false, 
            error: 'Failed to fetch package details' 
        }, { status: 500 });
    }
} 