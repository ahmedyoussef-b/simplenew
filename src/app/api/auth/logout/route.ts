// src/app/api/auth/logout/route.ts
import { NextResponse } from 'next/server';

export async function POST() {
  console.log('--- 👋 API: Logout ---');
  const response = NextResponse.json({ message: 'Logged out' });
  response.cookies.set('session_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: -1,
    path: '/',
  });
  console.log('🍪 Cookie de session supprimé.');
  return response;
}
