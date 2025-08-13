// src/app/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/hooks/redux-hooks';
import { selectCurrentUser, selectIsAuthLoading } from '@/lib/redux/slices/authSlice';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/components/layout/AuthLayout';
import { LoginForm } from '@/components/auth/LoginForm';
import Link from 'next/link';
import SocialSignInButtons from '@/components/auth/SocialSignInButtons';

export default function RootPage() {
  const router = useRouter();
  const user = useAppSelector(selectCurrentUser);
  const isLoading = useAppSelector(selectIsAuthLoading);

  useEffect(() => {
    // Ne rien faire pendant que l'état d'authentification est en cours de vérification.
    if (isLoading) {
      return;
    }

    // Si l'utilisateur est authentifié, le rediriger vers son tableau de bord.
    // Le composant /dashboard s'occupera de la redirection spécifique au rôle.
    if (user?.role) {
      router.replace('/dashboard');
    }
    // Si l'utilisateur n'est pas authentifié, le formulaire de connexion sera affiché.
    // Aucune redirection n'est nécessaire, ce qui empêche les boucles.
  }, [user, isLoading, router]);

  // Affiche un spinner pendant le chargement initial ou la redirection.
  if (isLoading || user) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  // Si non authentifié et que le chargement est terminé, affiche la page de connexion.
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
