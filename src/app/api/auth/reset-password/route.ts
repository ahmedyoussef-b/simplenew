// src/app/api/auth/reset-password/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { resetPasswordSchema } from '@/lib/formValidationSchemas';

const HASH_ROUNDS = 10;

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { password, token } = z.object({
            ...resetPasswordSchema.shape,
            token: z.string(),
        }).parse(body);
        
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        const user = await prisma.user.findFirst({
            where: {
                passwordResetToken: hashedToken,
                passwordResetExpires: { gt: new Date() },
            },
        });

        if (!user) {
            return NextResponse.json({ message: 'Token is invalid or has expired' }, { status: 400 });
        }
        
        const hashedPassword = await bcrypt.hash(password, HASH_ROUNDS);

        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                passwordResetToken: null,
                passwordResetExpires: null,
            },
        });

        return NextResponse.json({ message: 'Password has been reset successfully.' });

    } catch (error: any) {
        if (error.name === 'ZodError') {
            return NextResponse.json({ message: 'Invalid input', errors: error.errors }, { status: 400 });
        }
        return NextResponse.json({ message: 'An error occurred' }, { status: 500 });
    }
}
import { z } from 'zod';
