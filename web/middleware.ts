import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const accessToken = request.cookies.get('accessToken');
  const refreshToken = request.cookies.get('refreshToken');

  // If we have an access token, let the request through
  if (accessToken) {
    return NextResponse.next();
  }

  // If we have a refresh token but no access token, try to refresh
  if (refreshToken) {
    try {
      const response = await fetch('http://localhost:3000/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // If refresh was successful, let the request through
        return NextResponse.next();
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
    }
  }

  // If we're on the login or register page, let the request through
  if (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/register') {
    return NextResponse.next();
  }

  // Otherwise, redirect to login
  return NextResponse.redirect(new URL('/login', request.url));
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 