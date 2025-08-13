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

  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register') || pathname.startsWith('/forgot-password') || pathname.startsWith('/reset-password');
  const isDashboardRoute = pathname.startsWith('/admin') || pathname.startsWith('/teacher') || pathname.startsWith('/student') || pathname.startsWith('/parent') || pathname.startsWith('/list') || pathname.startsWith('/dashboard');

  // Allow unauthenticated users to access the root page (accueil) and auth pages
  if (!userRole && isDashboardRoute) {
    console.log(`[Middleware] Unauthenticated user on protected route ${pathname}. Redirecting to /login.`);
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // If user is authenticated and tries to access an auth page, redirect to dashboard
  if (userRole && isAuthPage) {
    console.log(`[Middleware] Authenticated user on auth page. Redirecting to /dashboard.`);
    return NextResponse.redirect(new URL('/dashboard', req.url));
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
     * - / (the root which is now the public accueil page)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|$).*)',
  ],
};
