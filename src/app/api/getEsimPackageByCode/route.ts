import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { generateHmacSignature } from '@/lib/utils';

const REDTEA_API_URL = 'https://api.esimaccess.com/api/v1/open/package/list';
const REDTEA_ACCESS_CODE = process.env.ESIM_ACCESS_CODE || 'e3ea14e1fe6547a29d3133fd220150b7';
const REDTEA_SECRET_KEY = process.env.ESIM_SECRET_KEY || '651c41ac694a4638902461297b67b156';

// Function to generate HMAC signature


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

                
            // Create data string for HMAC signature
            const dataString = `${REDTEA_ACCESS_CODE}${timestamp}`;
            
            // Generate HMAC signature
            const signature = generateHmacSignature(dataString, REDTEA_SECRET_KEY);


        // Make request to Redtea Mobile API
        const response = await fetch(REDTEA_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'RT-Timestamp': timestamp,
                'RT-AccessCode': REDTEA_ACCESS_CODE,
                'RT-Signature': signature
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