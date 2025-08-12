// src/app/api/auth/login/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { loginSchema } from '@/lib/formValidationSchemas';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = loginSchema.parse(body);

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.password) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    if (user.twoFactorEnabled) {
      // 1. Generate a temporary token
      const tempToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: '10m' });
      // 2. TODO: Generate and send 2FA code via email or authenticator app
      // For this example, we'll skip sending and assume a fixed code or another verification method
      console.log(`2FA Code for ${user.email}: 123456 (Not for production)`); // Placeholder
      return NextResponse.json({ requires2FA: true, tempToken });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    const response = NextResponse.json({ 
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        img: user.img,
        active: user.active,
        firstName: user.firstName,
        lastName: user.lastName,
        twoFactorEnabled: user.twoFactorEnabled
    });

    response.cookies.set('session_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });

    return response;
  } catch (error) {
    return NextResponse.json({ message: 'An error occurred' }, { status: 500 });
  }
}
