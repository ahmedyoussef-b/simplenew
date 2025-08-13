// src/app/(auth)/login/page.tsx
'use client';

import AuthLayout from '@/components/layout/AuthLayout';
import { LoginForm } from '@/components/auth/LoginForm';
import SocialSignInButtons from '@/components/auth/SocialSignInButtons';
import Link from 'next/link';

export default function LoginPage() {
  return (
       <AuthLayout
      title="Connectez-vous à votre compte"
      description="Entrez vos identifiants pour accéder à votre tableau de bord."
    >
      <LoginForm />
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Ou continuez avec
          </span>
        </div>
      </div>
      <SocialSignInButtons />
      <p className="mt-4 text-center text-sm text-muted-foreground">
        Pas encore de compte ?{' '}
        <Link href="/register" className="font-medium text-primary hover:underline">
          S'inscrire
        </Link>
      </p>
    </AuthLayout>
  );
}
