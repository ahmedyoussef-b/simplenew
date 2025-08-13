// src/app/(auth)/login/page.tsx
'use client';

import AuthLayout from '@/components/layout/AuthLayout';
import { LoginForm } from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
       <AuthLayout
      title="Connectez-vous à votre compte"
      description="Entrez vos identifiants pour accéder à votre tableau de bord."
    >
      <LoginForm />
    </AuthLayout>
  );
}
