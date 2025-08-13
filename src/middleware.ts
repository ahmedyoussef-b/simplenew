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

  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register') || pathname.startsWith('/forgot-password') || pathname.startsWith('/reset-password');
  
  // 1. If user is authenticated
  if (userRole) {
    // And tries to access an auth page, redirect them to their dashboard's entry point
    if (isAuthPage) {
        const dashboardPath = `/${userRole.toLowerCase()}`;
        console.log(`[Middleware] Authenticated user on auth page. Redirecting to ${dashboardPath}`);
        return NextResponse.redirect(new URL(dashboardPath, req.url));
    }
    
    // Check if the authenticated user has access to the requested protected route
    const isAllowed = Object.entries(routeAccessMap).some(([route, allowedRoles]) => {
      const regex = new RegExp(`^${route.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&').replace('\\*', '.*')}$`);
      if (regex.test(pathname)) {
        return allowedRoles.includes(userRole);
      }
      return false;
    });
    
    // Find if the path is protected at all
    const isProtectedRoute = Object.keys(routeAccessMap).some(route => {
        const regex = new RegExp(`^${route.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&').replace('\\*', '.*')}$`);
        return regex.test(pathname);
    });

    if (isProtectedRoute && !isAllowed) {
        const homePath = `/`;
        console.log(`[Middleware] Role '${userRole}' does not have access to ${pathname}. Redirecting to ${homePath}`);
        return NextResponse.redirect(new URL(homePath, req.url));
    }
  } 
  // 2. If user is NOT authenticated
  else {
    // And is trying to access a page that is NOT the root or an auth page, redirect to root login
    if (pathname !== '/' && !isAuthPage) {
        const isProtectedRoute = Object.keys(routeAccessMap).some(route => {
            const regex = new RegExp(`^${route.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&').replace('\\*', '.*')}$`);
            return regex.test(pathname);
        });
        
        if(isProtectedRoute){
            console.log(`[Middleware] Unauthenticated user on protected page ${pathname}. Redirecting to / (Login Page)`);
            return NextResponse.redirect(new URL('/', req.url));
        }
    }
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
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
