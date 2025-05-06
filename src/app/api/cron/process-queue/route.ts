import { NextResponse } from 'next/server';
import { QueueProcessor } from '@/lib/queueProcessor';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: Request) {
  try {
    // Verify the request is from Railway's cron
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
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