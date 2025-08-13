// src/app/(auth)/login/page.tsx
'use client';

import AuthLayout from '@/components/layout/AuthLayout';
import { LoginForm } from '@/components/auth/LoginForm';
import Link from 'next/link';

export default function LoginPage() {
  return (
       <AuthLayout
      title="Connectez-vous à votre compte"
      description="Entrez vos identifiants pour accéder à votre tableau de bord."
    >
      <LoginForm />
      <p className="mt-4 text-center text-sm text-muted-foreground">
        Pas encore de compte ?{' '}
        <Link href="/register" className="font-medium text-primary hover:underline">
          S'inscrire
        </Link>
      </p>
    </AuthLayout>
  );
}
