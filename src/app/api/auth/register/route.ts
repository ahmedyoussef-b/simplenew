// src/app/api/auth/register/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { registerSchema } from '@/lib/formValidationSchemas';
import { Role } from '@prisma/client';

const HASH_ROUNDS = 10;

export async function POST(req: Request) {
  console.log('--- 🌱 API: Register ---');
  try {
    const body = await req.json();
    const { email, password, name, role } = registerSchema.parse(body);
    console.log(`📝 Tentative d'inscription pour: ${email} avec le rôle: ${role}`);

    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      console.log('⚠️ Utilisateur déjà existant.');
      return NextResponse.json({ message: 'User already exists' }, { status: 409 });
    }

    console.log('🔒 Hachage du mot de passe...');
    const hashedPassword = await bcrypt.hash(password, HASH_ROUNDS);

    console.log('💾 Création de l\'utilisateur dans la DB...');
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
    console.log(`✅ Utilisateur créé avec l'ID: ${user.id}`);

    if (role === Role.TEACHER) {
        console.log('🧑‍🏫 Création du profil Enseignant...');
        await prisma.teacher.create({ data: { userId: user.id, name: name.split(' ')[0] || '', surname: name.split(' ')[1] || '' } });
        console.log('✅ Profil Enseignant créé.');
    } else if (role === Role.PARENT) {
        console.log('👨‍👩‍👧 Création du profil Parent...');
        await prisma.parent.create({ data: { userId: user.id, name: name.split(' ')[0] || '', surname: name.split(' ')[1] || '' } });
        console.log('✅ Profil Parent créé.');
    }

    // Omit password from the returned user object
    const { password: _, ...safeUser } = user;

    return NextResponse.json({ user: safeUser }, { status: 201 });

  } catch (error: any) {
    if (error.name === 'ZodError') {
      console.error('❌ Erreur de validation Zod:', error.errors);
      return NextResponse.json({ message: 'Invalid input', errors: error.errors }, { status: 400 });
    }
    console.error('❌ Erreur dans /api/auth/register:', error);
    return NextResponse.json({ message: 'An error occurred' }, { status: 500 });
  }
}
