// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getServerSession } from './lib/auth-utils';
import { routeAccessMap } from './lib/settings';
import { Role } from './types';

// This function can be marked `async` if using `await` inside
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  console.log(`🚦 [Middleware] Processing request for: ${pathname}`);
  const session = await getServerSession();
  const userRole = session?.user?.role as Role | undefined;
  console.log(`[Middleware] Session role found: ${userRole}`);

  // If user is authenticated, redirect from auth pages to their dashboard
  if (userRole) {
    if (pathname.startsWith('/login') || pathname.startsWith('/register')) {
      const dashboardPath = `/`; // Redirect to root, which will handle role-based redirection
      console.log(`[Middleware] Authenticated user on auth page. Redirecting to ${dashboardPath}`);
      return NextResponse.redirect(new URL(dashboardPath, req.url));
    }
  }

  // Route protection
  for (const route in routeAccessMap) {
    const regex = new RegExp(`^${route.replace('*', '.*')}$`);
    if (regex.test(pathname)) {
      const allowedRoles = routeAccessMap[route];
      console.log(`[Middleware] Path ${pathname} matches route ${route}. Allowed roles: ${allowedRoles}`);
      if (!userRole || !allowedRoles.includes(userRole)) {
        console.log(`[Middleware] Access denied for role '${userRole}'. Redirecting to /login`);
        return NextResponse.redirect(new URL('/login', req.url));
      }
      console.log(`[Middleware] Access granted for role '${userRole}'.`);
      break; 
    }
  }

  console.log(`[Middleware] No specific rule matched. Allowing request for ${pathname}`);
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
