import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    // Get the refresh token from the cookie
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get('refreshToken');
    
    if (refreshToken) {
      // Forward the logout request to the Go backend
      await fetch('http://localhost:8080/api/users/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshToken.value }),
      });
    }

    // Create a response
    const nextResponse = NextResponse.json({ success: true });
    
    // Clear the cookies
    nextResponse.cookies.set('accessToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });
    
    nextResponse.cookies.set('refreshToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });
    
    return nextResponse;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { message: 'An error occurred during logout' },
      { status: 500 }
    );
  }
} 