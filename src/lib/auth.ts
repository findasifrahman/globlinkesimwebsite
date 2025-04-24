import crypto from 'crypto';
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "./prisma";
import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import NextAuth from 'next-auth';

// Extend the built-in session and JWT types
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      emailVerified: Date | null;
    };
  }
  interface User {
    id: string;
    email: string;
    name: string;
    emailVerified: Date | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    emailVerified: Date | null;
  }
}

/**
 * Generates an HMAC-SHA256 signature for API requests
 * 
 * @param timestamp - Current timestamp
 * @param requestId - Unique request identifier
 * @param accessCode - User's access code
 * @param requestBody - JSON stringified request body
 * @param secretKey - Secret key for HMAC generation
 * @returns Lowercase hexadecimal signature
 */
export function generateHmacSignature(
  timestamp: string,
  requestId: string,
  accessCode: string,
  requestBody: string,
  secretKey: string
): string {
  // Concatenate the input parameters in the specified order
  const dataToSign = timestamp + requestId + accessCode + requestBody;
  
  // Create HMAC using SHA256 algorithm
  const hmac = crypto.createHmac('sha256', secretKey);
  
  // Update with the data to sign
  hmac.update(dataToSign);
  
  // Generate the signature and convert to lowercase hexadecimal
  return hmac.digest('hex').toLowerCase();
}

// Custom adapter that extends PrismaAdapter to include username
export const CustomPrismaAdapter = () => {
  const adapter = PrismaAdapter(prisma);
  
  return {
    ...adapter,
    createUser: async (data) => {
      // Generate a username from the email address
      const emailUsername = data.email?.split('@')[0] || '';
      const baseUsername = emailUsername.replace(/[^a-zA-Z0-9]/g, '');
      let username = baseUsername;
      let counter = 1;
      
      // Check if username exists and append a number if it does
      while (true) {
        const existingUser = await prisma.user.findUnique({
          where: { username },
        });
        
        if (!existingUser) {
          break;
        }
        
        username = `${baseUsername}${counter}`;
        counter++;
      }
      
      // Create the user with the generated username
      return prisma.user.create({
        data: {
          ...data,
          username,
        },
      });
    },
  };
};

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials');
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          }
        });

        if (!user || !user.password) {
          throw new Error('Invalid credentials');
        }

        const isCorrectPassword = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isCorrectPassword) {
          throw new Error('Invalid credentials');
        }

        return user;
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
        session.user.emailVerified = token.emailVerified;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.emailVerified = user.emailVerified;
      }
      return token;
    }
  },
  debug: process.env.NODE_ENV === 'development',
  secret: process.env.NEXTAUTH_SECRET,
}; 