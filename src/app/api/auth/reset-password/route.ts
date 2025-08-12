// src/app/api/auth/reset-password/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { resetPasswordSchema } from '@/lib/formValidationSchemas';
import { z } from 'zod';

const HASH_ROUNDS = 10;

// Define the schema for the request body including the token
const requestSchema = z.object({
  password: resetPasswordSchema.shape.password,
  confirmPassword: resetPasswordSchema.shape.confirmPassword,
  token: z.string().min(1, { message: "Token is required." }),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match.",
    path: ['confirmPassword'],
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const parsedBody = requestSchema.safeParse(body);

        if(!parsedBody.success) {
             return NextResponse.json({ message: 'Invalid input', errors: parsedBody.error.errors }, { status: 400 });
        }

        const { password, token } = parsedBody.data;
        
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
        console.error("Reset Password Error:", error);
        return NextResponse.json({ message: 'An internal error occurred' }, { status: 500 });
    }
}
