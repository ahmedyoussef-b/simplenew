// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getServerSession } from './lib/auth-utils';
import { routeAccessMap } from './lib/settings';
import { Role } from './types';

// This function can be marked `async` if using `await` inside
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const session = await getServerSession();
  const userRole = session?.user?.role as Role | undefined;

  // If user is authenticated, redirect from auth pages to their dashboard
  if (userRole) {
    if (pathname.startsWith('/login') || pathname.startsWith('/register') || pathname === '/') {
      const dashboardPath = `/${userRole.toLowerCase()}`;
      return NextResponse.redirect(new URL(dashboardPath, req.url));
    }
  }

  // Route protection
  for (const route in routeAccessMap) {
    const regex = new RegExp(`^${route.replace('*', '.*')}$`);
    if (regex.test(pathname)) {
      const allowedRoles = routeAccessMap[route];
      if (!userRole || !allowedRoles.includes(userRole)) {
        // Redirect to login page if not authenticated or role not allowed
        return NextResponse.redirect(new URL('/login', req.url));
      }
      break; 
    }
  }

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
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
