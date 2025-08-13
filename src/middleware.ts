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

  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register');

  // If user is authenticated, redirect from auth pages to their dashboard
  if (userRole && isAuthPage) {
    const dashboardPath = `/dashboard`;
    console.log(`[Middleware] Authenticated user on auth page. Redirecting to ${dashboardPath}`);
    return NextResponse.redirect(new URL(dashboardPath, req.url));
  }
  
  // If user is NOT authenticated and trying to access a protected page (not root, not auth pages)
  if (!userRole && pathname !== '/' && !isAuthPage) {
      // Check if the route is a protected one
      for (const route in routeAccessMap) {
        const regex = new RegExp(`^${route.replace('*', '.*')}$`);
        if (regex.test(pathname)) {
            console.log(`[Middleware] Unauthenticated user on protected page ${pathname}. Redirecting to /`);
            return NextResponse.redirect(new URL('/', req.url));
        }
      }
  }


  // Route protection for authenticated users
  if(userRole) {
      for (const route in routeAccessMap) {
        const regex = new RegExp(`^${route.replace('*', '.*')}$`);
        if (regex.test(pathname)) {
          const allowedRoles = routeAccessMap[route];
          console.log(`[Middleware] Path ${pathname} matches route ${route}. Allowed roles: ${allowedRoles}`);
          if (!allowedRoles.includes(userRole)) {
            console.log(`[Middleware] Access denied for role '${userRole}'. Redirecting to /`);
            return NextResponse.redirect(new URL('/', req.url));
          }
          console.log(`[Middleware] Access granted for role '${userRole}'.`);
          break; 
        }
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
