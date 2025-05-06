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

    const queueProcessor = QueueProcessor.getInstance();
    await queueProcessor.processQueueItems();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing queue:', error);
    return NextResponse.json(
      { error: 'Failed to process queue' },
      { status: 500 }
    );
  }
} 