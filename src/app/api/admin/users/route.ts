import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '0');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';

    // Build where clause
    const where: Prisma.UserWhereInput = search ? {
      OR: [
        { name: { contains: search, mode: 'insensitive' as const } },
        { username: { contains: search, mode: 'insensitive' as const } },
        { email: { contains: search, mode: 'insensitive' as const } },
        { country: { contains: search, mode: 'insensitive' as const } },
      ],
    } : {};

    // Get total count for pagination
    const totalCount = await prisma.user.count({ where });

    // Fetch users with pagination
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        country: true,
        createdAt: true,
        emailVerified: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip: page * limit,
      take: limit,
    });

    return NextResponse.json({
      users,
      totalCount,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
} 