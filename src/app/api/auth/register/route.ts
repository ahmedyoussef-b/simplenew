// src/app/api/auth/register/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { registerSchema } from '@/lib/formValidationSchemas';
import { Role } from '@prisma/client';

const HASH_ROUNDS = 10;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, name, role } = registerSchema.parse(body);

    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      return NextResponse.json({ message: 'User already exists' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, HASH_ROUNDS);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role,
        username: email, // or generate a unique username
        active: true, // or false until email verification
      },
    });

    if (role === Role.TEACHER) {
        await prisma.teacher.create({ data: { userId: user.id, name: name.split(' ')[0] || '', surname: name.split(' ')[1] || '' } });
    } else if (role === Role.PARENT) {
        await prisma.parent.create({ data: { userId: user.id, name: name.split(' ')[0] || '', surname: name.split(' ')[1] || '' } });
    }

    // Omit password from the returned user object
    const { password: _, ...safeUser } = user;

    return NextResponse.json({ user: safeUser }, { status: 201 });

  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ message: 'Invalid input', errors: error.errors }, { status: 400 });
    }
    return NextResponse.json({ message: 'An error occurred' }, { status: 500 });
  }
}
