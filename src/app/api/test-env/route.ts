import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    REDTEA_API_URL: process.env.REDTEA_API_URL,
    REDTEA_ACCESS_KEY: process.env.REDTEA_ACCESS_KEY ? 'Present' : 'Missing',
    REDTEA_SECRET_KEY: process.env.REDTEA_SECRET_KEY ? 'Present' : 'Missing',
    NODE_ENV: process.env.NODE_ENV,
  });
} 