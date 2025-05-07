import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { QueueProcessor } from '@/lib/queueProcessor';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    // Get the queue processor instance
    const queueProcessor = QueueProcessor.getInstance();

    // Process queue items
    await queueProcessor.startProcessing();

    // Close the Prisma connection
    await prisma.$disconnect();

    // Return success response
    return NextResponse.json({ 
      success: true, 
      message: 'Queue processing completed' 
    });
  } catch (error) {
    // Ensure Prisma connection is closed even if there's an error
    await prisma.$disconnect();
    
    console.error('Error processing queue:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to process queue' 
    }, { status: 500 });
  }
} 