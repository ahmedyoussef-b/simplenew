// src/app/api/auth/verify-2fa/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { verify2FASchema } from '@/lib/formValidationSchemas';
import { z } from 'zod';

// Define the schema for the request body including the tempToken
const requestSchema = z.object({
    code: verify2FASchema.shape.code,
    tempToken: z.string().min(1, { message: "Temporary token is required." }),
});

export async function POST(req: Request) {
  console.log('--- 🔐 API: Verify 2FA ---');
  try {
    const body = await req.json();
    const parsedBody = requestSchema.safeParse(body);

    if(!parsedBody.success) {
        console.error('❌ Erreur de validation Zod:', parsedBody.error.errors);
        return NextResponse.json({ message: 'Invalid input', errors: parsedBody.error.errors }, { status: 400 });
    }

    const { code, tempToken } = parsedBody.data;
    console.log('🔍 Vérification du jeton temporaire et du code 2FA...');

    let decodedTemp;
    try {
        decodedTemp = jwt.verify(tempToken, process.env.JWT_SECRET!) as { userId: string };
    } catch (e) {
        console.log('⚠️ Jeton temporaire invalide ou expiré.');
        return NextResponse.json({ message: 'Temporary token is invalid or expired.' }, { status: 401 });
    }
    
    const user = await prisma.user.findUnique({ where: { id: decodedTemp.userId } });
    if (!user) {
      console.log('🛑 Utilisateur non trouvé pour le jeton temporaire.');
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }
    console.log(`✅ Utilisateur trouvé: ${user.email}`);

    // TODO: Implement actual 2FA code verification logic
    // This should involve comparing the user's code with a stored secret (e.g., from an authenticator app)
    console.log('🤫 Logique de vérification 2FA en place (simulation)...');
    const isCodeValid = code === '123456'; // Placeholder for actual verification. Never use this in production.

    if (!isCodeValid) {
      console.log('🛑 Code 2FA invalide.');
      return NextResponse.json({ message: 'Invalid 2FA code' }, { status: 401 });
    }
    console.log('✅ Code 2FA valide.');

    // If code is valid, issue the final session token
    console.log('🔑 Génération du JWT de session final...');
    const token = jwt.sign(
      { userId: user.id, role: user.role, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );
    
    // Omit password before sending user data to client
    const { password: _, ...safeUser } = user;
    const response = NextResponse.json({ user: safeUser });

    response.cookies.set('session_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });
    console.log('🍪 Cookie de session final créé.');

    return response;

  } catch (error: any) {
    if (error.name === 'ZodError') {
        return NextResponse.json({ message: 'Invalid input', errors: error.errors }, { status: 400 });
    }
    console.error("❌ Erreur dans /api/auth/verify-2fa:", error);
    return NextResponse.json({ message: 'An internal error occurred' }, { status: 500 });
  }
}
