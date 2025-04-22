import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { sendVerificationEmail } from '@/lib/email';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const { name, email, password, username } = await request.json();

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Generate username from email if not provided
    let finalUsername = username;
    if (!finalUsername) {
      const emailUsername = email.split('@')[0];
      const baseUsername = emailUsername.replace(/[^a-zA-Z0-9]/g, '');
      let counter = 1;
      
      // Check if username exists and append a number if it does
      while (true) {
        const existingUsername = await prisma.user.findUnique({
          where: { username: baseUsername + (counter > 1 ? counter : '') },
        });
        
        if (!existingUsername) {
          finalUsername = baseUsername + (counter > 1 ? counter : '');
          break;
        }
        
        counter++;
      }
    } else {
      // Check if provided username already exists
      const existingUsername = await prisma.user.findUnique({
        where: { username: finalUsername },
      });
      
      if (existingUsername) {
        return NextResponse.json(
          { error: 'Username already taken' },
          { status: 409 }
        );
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const hashedVerificationToken = crypto
      .createHash('sha256')
      .update(verificationToken)
      .digest('hex');

    // Create user with verification token
    const user = await prisma.user.create({
      data: {
        name,
        email,
        username: finalUsername,
        password: hashedPassword,
        verificationToken: hashedVerificationToken,
        verificationTokenExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
    });

    // Send verification email
    await sendVerificationEmail(email, verificationToken);

    // Remove sensitive data from response
    const { password: _, verificationToken: __, ...userWithoutSensitive } = user;

    return NextResponse.json(
      { 
        message: 'User registered successfully. Please check your email to verify your account.',
        user: userWithoutSensitive,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'An error occurred during registration' },
      { status: 500 }
    );
  }
} 