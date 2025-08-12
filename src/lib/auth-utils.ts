// src/lib/auth-utils.ts
'use server';

import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import type { JwtPayload, SafeUser } from '@/types';
import prisma from './prisma';

export async function getServerSession() {
  const cookieStore = cookies();
  const token = cookieStore.get('session_token')?.value;

  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        img: true,
        active: true,
        firstName: true,
        lastName: true,
        twoFactorEnabled: true,
      }
    });

    if (!user) {
      return null;
    }

    return { user: user as SafeUser };
  } catch (error) {
    console.error('Invalid token:', error);
    return null;
  }
}
