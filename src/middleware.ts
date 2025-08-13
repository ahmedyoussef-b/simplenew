// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getServerSession } from './lib/auth-utils';
import { Role } from './types';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  console.log(`🚦 [Middleware] Processing request for: ${pathname}`);
  const session = await getServerSession();
  const userRole = session?.user?.role as Role | undefined;

  const isAuthPage = pathname === '/login'; // Only the login page is an auth page now
  const isTempDashboard = /^\/temp-(admin|teacher|student|parent)$/.test(pathname);
  
  // If user is not authenticated and tries to access a protected dashboard, redirect to root (which is the login page)
  if (!userRole && isTempDashboard) {
    console.log(`[Middleware] Unauthenticated user on protected route ${pathname}. Redirecting to /.`);
    return NextResponse.redirect(new URL('/', req.url));
  }

  // If user is authenticated and tries to access the login page, redirect to root (which will then redirect to their dashboard)
  if (userRole && isAuthPage) {
    console.log(`[Middleware] Authenticated user on login page. Redirecting to /.`);
    return NextResponse.redirect(new URL('/', req.url));
  }

  console.log(`[Middleware] No specific rule matched for user role '${userRole}' on path '${pathname}'. Allowing request.`);
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - any other static assets in /public
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
};