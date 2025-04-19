import React from 'react';
import { render } from '@testing-library/react';
import HomePage from '../app/page';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

// Mock the next/navigation and next/headers modules
jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));

jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}));

describe('HomePage', () => {
  it('should redirect to dashboard when access token exists', async () => {
    // Mock cookies to return an access token
    (cookies as jest.Mock).mockReturnValue({
      get: jest.fn().mockReturnValue({ value: 'test-token' }),
    });

    await HomePage();
    expect(redirect).toHaveBeenCalledWith('/dashboard');
  });

  it('should redirect to login when no access token exists', async () => {
    // Mock cookies to return no access token
    (cookies as jest.Mock).mockReturnValue({
      get: jest.fn().mockReturnValue(null),
    });

    await HomePage();
    expect(redirect).toHaveBeenCalledWith('/login');
  });
});
