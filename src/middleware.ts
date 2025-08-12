// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Role } from '@prisma/client';
import * as jose from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

const protectedRoutes = {
    [Role.ADMIN]: ['/admin'],
    [Role.TEACHER]: ['/teacher-dashboard'],
    [Role.PARENT]: ['/parent-dashboard'],
    [Role.STUDENT]: ['/student-dashboard'],
};
const commonProtectedRoutes = ['/dashboard', '/profile'];

const allProtectedRoutes = [...Object.values(protectedRoutes).flat(), ...commonProtectedRoutes];

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;
    const sessionToken = req.cookies.get('session_token')?.value;

    const isProtectedRoute = allProtectedRoutes.some(route => pathname.startsWith(route));

    if (isProtectedRoute) {
        if (!sessionToken) {
            return NextResponse.redirect(new URL('/login', req.url));
        }

        try {
            const { payload } = await jose.jwtVerify(sessionToken, secret) as { payload: { role: Role } };
            const userRole = payload.role;
            
            // Check role-specific access
            const allowedRoutesForRole = protectedRoutes[userRole] || [];
            const isAccessingAllowedRoute = allowedRoutesForRole.some(route => pathname.startsWith(route));
            
            // Allow access to common protected routes for all authenticated users
            const isAccessingCommonRoute = commonProtectedRoutes.some(route => pathname.startsWith(route));

            if (!isAccessingAllowedRoute && !isAccessingCommonRoute) {
                // If user tries to access a route not meant for their role, redirect to their default dashboard
                const defaultDashboard = `/dashboard`;
                return NextResponse.redirect(new URL(defaultDashboard, req.url));
            }

        } catch (err) {
            // Token is invalid, redirect to login
            return NextResponse.redirect(new URL('/login', req.url));
        }
    }

    // For public routes like /login, if user is authenticated, redirect to dashboard
    if (['/login', '/register', '/forgot-password'].includes(pathname)) {
        if (sessionToken) {
            try {
                await jose.jwtVerify(sessionToken, secret);
                return NextResponse.redirect(new URL('/dashboard', req.url));
            } catch (err) {
                // Invalid token, allow access to public page
            }
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
