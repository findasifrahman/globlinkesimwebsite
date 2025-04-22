import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { headers } from 'next/headers';

export async function GET() {
  try {
    const headersList = await headers();
    const userId = headersList.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const result = await sql`
      SELECT 
        id, 
        orderNo, 
        packageCode, 
        count, 
        price, 
        periodNum, 
        status, 
        createdAt
      FROM orderProfile
      WHERE userId = ${userId}
      ORDER BY createdAt DESC;
    `;

    return NextResponse.json({
      orders: result.rows
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
} 