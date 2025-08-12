// src/app/api/auth/forgot-password/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { forgotPasswordSchema } from '@/lib/formValidationSchemas';

export async function POST(req: Request) {
  try {
    const { email } = forgotPasswordSchema.parse(await req.json());

    const user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      const resetToken = crypto.randomBytes(32).toString('hex');
      const passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
      
      const passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      await prisma.user.update({
        where: { email },
        data: { passwordResetToken, passwordResetExpires },
      });
      
      const resetURL = `${req.headers.get('origin')}/reset-password?token=${resetToken}`;

      // Configure Nodemailer
      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT),
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      });

      await transporter.sendMail({
          from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM_EMAIL}>`,
          to: email,
          subject: 'Your Password Reset Link',
          html: `<p>You requested a password reset. Click the link below to reset your password:</p><a href="${resetURL}">${resetURL}</a><p>This link will expire in 10 minutes.</p>`,
      });
    }

    // Always return a success response to prevent email enumeration
    return NextResponse.json({ message: 'If a user with that email exists, a reset link has been sent.' });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'An error occurred' }, { status: 500 });
  }
}
