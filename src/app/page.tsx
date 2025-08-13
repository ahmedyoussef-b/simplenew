// src/app/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/hooks/redux-hooks';
import { selectIsAuthenticated, selectIsAuthLoading } from '@/lib/redux/slices/authSlice';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/components/layout/AuthLayout';
import { LoginForm } from '@/components/auth/LoginForm';
import SocialSignInButtons from '@/components/auth/SocialSignInButtons';
import Link from 'next/link';

export default function RootPage() {
  const router = useRouter();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isLoading = useAppSelector(selectIsAuthLoading);

  useEffect(() => {
    // If the session is loaded and the user is authenticated, redirect them.
    if (!isLoading && isAuthenticated) {
      console.log(`✅ [RootPage] User is authenticated, redirecting to /accueil`);
      router.replace('/accueil');
    }
  }, [isAuthenticated, isLoading, router]);

  // While checking the session, show a loading spinner
  if (isLoading || isAuthenticated) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  // If the user is not authenticated, display the login page.
  console.log("🛑 [RootPage] User is not authenticated, showing login form.");
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