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
          emailVerified: new Date(), // Auto-verify email for OAuth users
        },
      });
    },
  };
};

export const authOptions: NextAuthOptions = {
  adapter: CustomPrismaAdapter(),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: 'select_account', // ensures account chooser shows,
          access_type: "offline",
          response_type: "code",
          state: crypto.randomBytes(32).toString('hex')
        }
      },
      profile(profile) {
        console.log('Google Profile:', profile);
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          emailVerified: new Date(),
        };
      },
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
    updateAge: 24 * 60 * 60, // 24 hours
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    },
    callbackUrl: {
      name: `next-auth.callback-url`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    },
    csrfToken: {
      name: `next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    }
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
    },
    async redirect({ url, baseUrl }) {
      if (url.includes('/callback/google/callback/google')) {
        return `${baseUrl}/api/auth/callback/google`;
      }
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
}; 