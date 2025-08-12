// src/app/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/hooks/redux-hooks';
import { selectCurrentUser, selectIsAuthLoading, selectIsAuthenticated } from '@/lib/redux/slices/authSlice';
import { Spinner } from '@/components/ui/spinner';
import AccueilZenPage from './(dashboard)/dashboard/page'; // Adjusted import path

export default function RootPage() {
  const router = useRouter();
  const user = useAppSelector(selectCurrentUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isLoading = useAppSelector(selectIsAuthLoading);

  useEffect(() => {
    // This effect handles redirection for LOGGED-IN users.
    // If auth state is still loading, we wait.
    if (isLoading) {
      return;
    }
    
    // If the user is authenticated, redirect them to their specific role's dashboard.
    // The dashboard layout will handle the actual content.
    if (isAuthenticated && user) {
        router.replace(`/${user.role.toLowerCase()}`);
    }
    
    // If not authenticated, this component does nothing, and the public page is rendered below.
    
  }, [user, isAuthenticated, isLoading, router]);

  // While checking the session, show a loading spinner to prevent flicker.
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  // If the user is authenticated, they will be redirected by the useEffect.
  // In the meantime, or if they are not authenticated, render the public-facing Zen page.
  return <AccueilZenPage />;
}
