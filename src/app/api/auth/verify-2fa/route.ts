// src/app/api/auth/verify-2fa/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { verify2FASchema } from '@/lib/formValidationSchemas';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { code, tempToken } = z.object({
        ...verify2FASchema.shape,
        tempToken: z.string(),
    }).parse(body);

    if (!tempToken) {
        return NextResponse.json({ message: 'Temporary token is missing.' }, { status: 400 });
    }

    let decodedTemp;
    try {
        decodedTemp = jwt.verify(tempToken, process.env.JWT_SECRET!) as { userId: string };
    } catch (e) {
        return NextResponse.json({ message: 'Temporary token is invalid or expired.' }, { status: 401 });
    }
    
    const user = await prisma.user.findUnique({ where: { id: decodedTemp.userId } });
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // TODO: Implement actual 2FA code verification logic
    const isCodeValid = code === '123456'; // Placeholder for actual verification

    if (!isCodeValid) {
      return NextResponse.json({ message: 'Invalid 2FA code' }, { status: 401 });
    }

    // If code is valid, issue the final session token
    const token = jwt.sign(
      { userId: user.id, role: user.role, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );
    
    const { password: _, ...safeUser } = user;
    const response = NextResponse.json(safeUser);

    response.cookies.set('session_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });

    return response;

  } catch (error: any) {
    if (error.name === 'ZodError') {
        return NextResponse.json({ message: 'Invalid input', errors: error.errors }, { status: 400 });
    }
    return NextResponse.json({ message: 'An error occurred' }, { status: 500 });
  }
}
import { z } from 'zod';
