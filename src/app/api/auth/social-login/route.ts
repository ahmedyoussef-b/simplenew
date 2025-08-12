// src/app/api/auth/social-login/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';
import admin from '@/lib/firebase-admin'; // Use the initialized admin instance

export async function POST(req: Request) {
    try {
        const { idToken } = await req.json();

        if (!idToken) {
            return NextResponse.json({ message: 'ID token is required' }, { status: 400 });
        }

        // Verify the ID token with Firebase Admin SDK
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const { email, name, picture } = decodedToken;

        if (!email) {
            return NextResponse.json({ message: 'Email not found in social provider token' }, { status: 400 });
        }
        
        let user = await prisma.user.findUnique({
            where: { email },
        });

        // If user doesn't exist, create a new one
        if (!user) {
            user = await prisma.user.create({
                data: {
                    email,
                    name: name || email.split('@')[0],
                    username: email,
                    img: picture,
                    role: Role.PARENT, // Default role for social sign-ups
                    active: true,
                },
            });

            // Create a corresponding parent profile
            await prisma.parent.create({
                data: {
                    userId: user.id,
                    name: name?.split(' ')[0] || '',
                    surname: name?.split(' ')[1] || 'User',
                }
            });
        }

        // Generate a session token for our application
        const token = jwt.sign(
            { userId: user.id, role: user.role, email: user.email },
            process.env.JWT_SECRET!,
            { expiresIn: '7d' }
        );
        
        // Omit sensitive data before sending the user object to the client
        const { password: _, ...safeUser } = user;
        const response = NextResponse.json({ user: safeUser });

        // Set the session token in an HTTP-only cookie for security
        response.cookies.set('session_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 7, // 1 week
            path: '/',
        });

        return response;

    } catch (error) {
        console.error('Social login error:', error);
        // Handle potential token verification errors
        if (error instanceof Error && 'code' in error && (error as any).code?.startsWith('auth/')) {
            return NextResponse.json({ message: 'Invalid or expired social token.' }, { status: 401 });
        }
        return NextResponse.json({ message: 'Authentication failed' }, { status: 500 });
    }
}
