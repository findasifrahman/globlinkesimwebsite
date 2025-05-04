import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { packages, startIndex, batchSize } = await request.json();

    if (!packages || !Array.isArray(packages)) {
      return NextResponse.json(
        { success: false, message: 'Invalid packages data' },
        { status: 400 }
      );
    }

    const endIndex = Math.min(startIndex + batchSize, packages.length);
    const batch = packages.slice(startIndex, endIndex);

    let createdCount = 0;
    let updatedCount = 0;

    for (const pkg of batch) {
      try {
        const existingPackage = await prisma.allPackage.findUnique({
          where: { packageCode: pkg.packageCode }
        });

        if (existingPackage) {
          await prisma.allPackage.update({
            where: { packageCode: pkg.packageCode },
            data: pkg
          });
          updatedCount++;
        } else {
          await prisma.allPackage.create({
            data: pkg
          });
          createdCount++;
        }
      } catch (error) {
        console.error(`Error processing package ${pkg.packageCode}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Batch processed successfully',
      counts: {
        created: createdCount,
        updated: updatedCount,
        deleted: 0
      },
      progress: {
        current: endIndex,
        total: packages.length
      }
    });
  } catch (error) {
    console.error('Error processing packages:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to process packages', error: String(error) },
      { status: 500 }
    );
  }
} 