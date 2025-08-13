// src/app/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/hooks/redux-hooks';
import { selectCurrentUser, selectIsAuthLoading } from '@/lib/redux/slices/authSlice';
import { Spinner } from '@/components/ui/spinner';

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
    } else {
      // Si l'utilisateur n'est pas authentifié, le middleware se sera déjà assuré qu'il est redirigé vers /login.
      // S'il atterrit ici, c'est probablement que la page de login doit s'afficher.
      // Le middleware gère la redirection vers /login, donc nous n'avons rien à faire ici.
      // Nous allons rediriger vers /login explicitement pour être sûrs.
      router.replace('/login');
    }
  }, [user, isLoading, router]);

  // Affiche un spinner pendant le chargement initial ou la redirection.
  return (
      <div className="flex h-screen w-full items-center justify-center">
        <Spinner size="lg" />
      </div>
  );
}
