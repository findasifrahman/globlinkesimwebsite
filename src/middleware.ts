import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { NextRequestWithAuth } from 'next-auth/middleware';
import type { NextRequest } from 'next/server';

// Define paths that don't require authentication
const publicPaths = [
  '/',
  '/auth/signin',
  '/register',
  '/verify-email',
  '/forgot-password',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/verify-email',
];

interface Token {
  userId: string;
  role?: string;
  emailVerified?: boolean;
}

export default async function middleware(request: NextRequestWithAuth) {
  const path = request.nextUrl.pathname;

  const host = request.headers.get('host') || '';

  // Redirect non-www to www for globlinksolution.com
  if (host === 'globlinksolution.com') {
    const url = request.nextUrl.clone();
    url.hostname = 'www.globlinksolution.com';
    return NextResponse.redirect(url);
  }
  // Handle admin routes
  if (path.startsWith('/admin')) {
    // Allow access to the login page
    if (path === '/admin/login') {
      return NextResponse.next();
    }

    // Check for admin authentication
    const adminAuth = request.cookies.get('adminAuth');
    if (!adminAuth) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    return NextResponse.next();
  }

  // Handle regular authentication
  // Check if the path is public
  if (publicPaths.some(prefix => path.startsWith(prefix))) {
    return NextResponse.next();
  }

  const token = await getToken({ req: request });
  
  // If user is not logged in and trying to access protected route, redirect to login
  if (!token) {
    const callbackUrl = encodeURIComponent(request.url);
    return NextResponse.redirect(new URL(`/auth/signin?callbackUrl=${callbackUrl}`, request.url));
  }

  // If user is logged in and trying to access auth pages, redirect to home
  if (token && (path.startsWith('/auth/') || path === '/register')) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Check if email is verified
  if (!token.emailVerified) {
    // Allow access to verification page and API routes
    if (path.startsWith('/verify-email') || 
        path.startsWith('/api/')) {
      return NextResponse.next();
    }

    // For all other routes, show warning but allow access
    const response = NextResponse.next();
    response.headers.set('x-email-verified', 'false');
    return response;
  }

  // Add user info to headers for downstream use
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-id', token.sub || '');
  requestHeaders.set('x-user-role', (token as any).role || 'user');

  // Return response with modified headers
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

// Configure which paths should be processed by this middleware
export const config = {
  matcher: [
    '/admin/:path*',
    '/dashboard/:path*',
    '/profile/:path*',
    '/verify-email/:path*',
    '/api/:path*',
    /*
     * Match all request paths except:
     * 1. /api/webhook (webhook endpoint)
     * 2. /_next (Next.js internals)
     * 3. /static (static files)
     * 4. /favicon.ico, /robots.txt (static files)
     */
    '/((?!api/webhook|_next/static|_next/image|favicon.ico|robots.txt).*)',
  ],
}; 