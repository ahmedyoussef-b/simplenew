// src/app/api/auth/social-login/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';

export async function POST(req: Request) {
    try {
        // Assuming the social login provider directly returns user information
        // Modify this part to integrate with your social login provider's response
        const { email, name, picture } = await req.json();

        if (!email) {
            return NextResponse.json({ message: 'Email not found in social provider' }, { status: 400 });
        }
        
        let user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            // New user, create them. Default role to PARENT, can be changed later.
            user = await prisma.user.create({
                data: {
                    email,
                    name: name || email.split('@')[0],
                    username: email,
                    img: picture,
                    role: Role.PARENT, // Default role
                    active: true,
                },
            });
            // Also create a corresponding parent/teacher profile
            await prisma.parent.create({
                data: {
                    userId: user.id,
                    name: name?.split(' ')[0] || '',
                    surname: name?.split(' ')[1] || '',
                }
            });
        }

        const token = jwt.sign(
            { userId: user.id, role: user.role, email: user.email },
            process.env.JWT_SECRET!,
            { expiresIn: '7d' }
        );
        
        const { password: _, ...safeUser } = user;
        const response = NextResponse.json({ user: safeUser });

        response.cookies.set('session_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 7, // 1 week
            path: '/',
        });

        return response;

    } catch (error) {
        console.error('Social login error:', error);
        return NextResponse.json({ message: 'Authentication failed' }, { status: 401 });
    }
}
