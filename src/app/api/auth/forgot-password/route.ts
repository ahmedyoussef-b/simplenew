// src/app/api/auth/forgot-password/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { forgotPasswordSchema } from '@/lib/formValidationSchemas';

export async function POST(req: Request) {
  console.log('--- 🔑 API: Forgot Password ---');
  try {
    const { email } = forgotPasswordSchema.parse(await req.json());
    console.log(`📧 E-mail reçu pour la réinitialisation:`, email);

    const user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      console.log('✅ Utilisateur trouvé. Génération du jeton...');
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
      console.log(`🔗 URL de réinitialisation générée: ${resetURL}`);

      // Configure Nodemailer
      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT),
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      });

      console.log('📬 Envoi de l'e-mail de réinitialisation...');
      await transporter.sendMail({
          from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM_EMAIL}>`,
          to: email,
          subject: 'Your Password Reset Link',
          html: `<p>You requested a password reset. Click the link below to reset your password:</p><a href="${resetURL}">${resetURL}</a><p>This link will expire in 10 minutes.</p>`,
      });
      console.log('✅ E-mail envoyé avec succès.');
    } else {
        console.log('⚠️ Utilisateur non trouvé. Aucune action prise.');
    }

    // Always return a success response to prevent email enumeration
    return NextResponse.json({ message: 'If a user with that email exists, a reset link has been sent.' });

  } catch (error) {
    console.error('❌ Erreur dans /api/auth/forgot-password:', error);
    return NextResponse.json({ message: 'An error occurred' }, { status: 500 });
  }
}
