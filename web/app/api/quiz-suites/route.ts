import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    // Get the access token from the cookie
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken');
    
    if (!accessToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Forward the request to the Go backend
    const response = await fetch('http://localhost:8080/api/quiz-suites', {
      headers: {
        'Authorization': `Bearer ${accessToken.value}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      // If the token is expired, try to refresh it
      if (response.status === 401) {
        const refreshToken = cookieStore.get('refreshToken');
        
        if (!refreshToken) {
          return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
          );
        }

        // Try to refresh the token
        const refreshResponse = await fetch('http://localhost:8080/api/users/refresh', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            refresh_token: refreshToken.value,
          }),
        });

        if (!refreshResponse.ok) {
          return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
          );
        }

        const refreshData = await refreshResponse.json();

        // Set the new tokens in cookies
        const res = NextResponse.json(refreshData.user, { status: 200 });
        
        res.cookies.set('accessToken', refreshData.access_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 15 * 60, // 15 minutes
        });

        res.cookies.set('refreshToken', refreshData.refresh_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 7 * 24 * 60 * 60, // 7 days
        });

        return res;
      }

      return NextResponse.json(
        { error: data.error || 'Failed to fetch quiz suites' },
        { status: response.status }
      );
    }

    // Return the quiz suites array directly
    return NextResponse.json({ quiz_suites: data.quiz_suites || [] });
  } catch (error) {
    console.error('Error fetching quiz suites:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get the access token from the cookie
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken');
    
    if (!accessToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Forward the request to the Go backend
    const response = await fetch('http://localhost:8080/api/quiz-suites', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken.value}`,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      // If the token is expired, try to refresh it
      if (response.status === 401) {
        const refreshToken = cookieStore.get('refreshToken');
        
        if (!refreshToken) {
          return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
          );
        }

        // Try to refresh the token
        const refreshResponse = await fetch('http://localhost:8080/api/users/refresh', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            refresh_token: refreshToken.value,
          }),
        });

        if (!refreshResponse.ok) {
          return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
          );
        }

        const refreshData = await refreshResponse.json();

        // Set the new tokens in cookies
        const res = NextResponse.json(refreshData.user, { status: 200 });
        
        res.cookies.set('accessToken', refreshData.access_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 15 * 60, // 15 minutes
        });

        res.cookies.set('refreshToken', refreshData.refresh_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 7 * 24 * 60 * 60, // 7 days
        });

        return res;
      }

      return NextResponse.json(
        { error: data.error || 'Failed to create quiz suite' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating quiz suite:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 