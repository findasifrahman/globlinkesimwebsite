import { NextResponse } from 'next/server';
import { prisma } from '@/lib/init-prisma';
import crypto from 'crypto';
import { sendPasswordResetEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Return success even if user doesn't exist to prevent email enumeration
      return NextResponse.json(
        { message: 'If an account exists, a password reset email will be sent' },
        { status: 200 }
      );
    }

    // Check if user was registered with OAuth (no password set)
    if (!user.password) {
      return NextResponse.json(
        { error: 'This email was registered using Google. Please use the "Sign in with Google" option to access your account.' },
        { status: 400 }
      );
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Update user with reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: hashedResetToken,
        resetTokenExpiry: new Date(Date.now() + 1 * 60 * 60 * 1000), // 1 hour
      },
    });

    // Send password reset email
    await sendPasswordResetEmail(email, resetToken);

    return NextResponse.json(
      { message: 'If an account exists, a password reset email will be sent' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in forgot password:', error);
    return NextResponse.json(
      { error: 'Failed to process password reset request' },
      { status: 500 }
    );
  }
} 