import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { QueueProcessor } from '@/lib/queueProcessor';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { orderNo, type, priority } = body;

    if (!orderNo || !type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const queueProcessor = QueueProcessor.getInstance();
    await queueProcessor.addToQueue(type, orderNo);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error adding to queue:', error);
    return NextResponse.json(
      { error: 'Failed to add to queue' },
      { status: 500 }
    );
  }
} 