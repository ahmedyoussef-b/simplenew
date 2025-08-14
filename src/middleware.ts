// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Role } from '@/types';
import { routeAccessMap } from '@/lib/settings';
import { SESSION_COOKIE_NAME } from './lib/constants';

interface JwtPayload {
  userId: string;
  role: Role;
  iat: number;
  exp: number;
}

// Function to decode JWT without external libraries
function decodeJwt(token: string): JwtPayload | null {
    try {
        const base64Url = token.split('.')[1];
        if (!base64Url) return null;
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error("Error decoding JWT:", error);
        return null;
    }
}


export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  console.log(`🚦 [Middleware] Processing request for: ${pathname}`);

  const sessionToken = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  let userRole: Role | undefined;

  if (sessionToken) {
    const decodedToken = decodeJwt(sessionToken);
    if (decodedToken && decodedToken.exp * 1000 > Date.now()) {
      userRole = decodedToken.role;
    }
  }
  console.log(`[Middleware] Session role found: ${userRole}`);
  
  const loginUrl = new URL('/login', req.url);

  // --- Route Protection Logic ---
  
  // If user is not authenticated and tries to access a protected route
  if (!userRole && !['/login', '/register', '/accueil', '/'].includes(pathname)) {
      const isProtectedRoute = Object.entries(routeAccessMap).some(([route, roles]) => 
          new RegExp(`^${route.replace(':path*', '.*')}$`).test(pathname) && !roles.includes(Role.VISITOR)
      );

      if(isProtectedRoute) {
        console.log(`[Middleware] Unauthorized access to ${pathname}, redirecting to login.`);
        return NextResponse.redirect(loginUrl);
      }
  }
  
  // If user is authenticated, check their role against the route map
  if (userRole) {
    // Redirect logged-in users from auth pages to their dashboard
    if (['/login', '/register', '/accueil', '/'].includes(pathname)) {
        console.log(`[Middleware] User is already logged in. Redirecting from ${pathname} to /dashboard.`);
        return NextResponse.redirect(new URL('/dashboard', req.url));
    }
      
    const allowedRoles = Object.entries(routeAccessMap).find(([route]) => 
      new RegExp(`^${route.replace(':path*', '.*')}$`).test(pathname)
    )?.[1];

    if (allowedRoles && !allowedRoles.includes(userRole)) {
      console.log(`[Middleware] Role '${userRole}' not allowed for ${pathname}. Redirecting to home.`);
      // Redirect to a generic "access denied" or home page for their role
      return NextResponse.redirect(new URL(`/${userRole.toLowerCase()}`, req.url));
    }
  }

  console.log(`[Middleware] Allowing request to ${pathname}.`);
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
    '/((?!api|_next/static|_next/image|.*\\..*).*)',
  ],
};
