// src/app/api/auth/login/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { loginSchema } from '@/lib/formValidationSchemas';

export async function POST(req: Request) {
  console.log('--- 🚀 API: Login Attempt ---');
  try {
    const body = await req.json();
    const { email, password } = loginSchema.parse(body);
    console.log(`👤 Tentative de connexion pour: ${email}`);

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.password) {
      console.log('🛑 Utilisateur non trouvé ou sans mot de passe.');
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }
    console.log('✅ Utilisateur trouvé.');

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log('🔑 Mot de passe invalide.');
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }
    console.log('🔑 Mot de passe valide.');

    if (user.twoFactorEnabled) {
      console.log('🔒 2FA activé. Génération du jeton temporaire.');
      const tempToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: '10m' });
      // For this example, we'll skip sending and assume a fixed code or another verification method
      console.log(`🤫 Code 2FA pour ${user.email}: 123456 (Ne pas utiliser en production)`);
      return NextResponse.json({ requires2FA: true, tempToken });
    }

    console.log('✅ Connexion réussie. Génération du JWT final.');
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
    console.log('🍪 Cookie de session créé.');

    return response;
  } catch (error) {
    console.error('❌ Erreur dans /api/auth/login:', error);
    return NextResponse.json({ message: 'An error occurred' }, { status: 500 });
  }
}
