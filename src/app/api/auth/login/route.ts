// src/app/api/auth/login/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { loginSchema } from '@/lib/formValidationSchemas';
import { SESSION_COOKIE_NAME } from '@/lib/constants';

export async function POST(req: NextRequest) {
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
    
    console.log('✅ Connexion réussie. Génération du JWT final.');
    const token = jwt.sign(
      { userId: user.id, role: user.role, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );
    
    // Instead of returning JSON, we set the cookie and then redirect the user.
    // This is the POST-Redirect-GET pattern.
    console.log('🍪 Cookie de session créé. Préparation de la redirection...');
    
    // Create a response object to set the cookie
    const response = NextResponse.json({ success: true, message: 'Login successful' });
    
    response.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });

    return response;

  } catch (error) {
    console.error('❌ Erreur dans /api/auth/login:', error);
    return NextResponse.json({ message: 'An error occurred' }, { status: 500 });
  }
}