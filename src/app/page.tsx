// src/app/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/hooks/redux-hooks';
import { selectCurrentUser, selectIsAuthLoading, selectIsAuthenticated } from '@/lib/redux/slices/authSlice';
import { Spinner } from '@/components/ui/spinner';
import { Role } from '@/types';

export default function RootPage() {
  const router = useRouter();
  const user = useAppSelector(selectCurrentUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isLoading = useAppSelector(selectIsAuthLoading);

  useEffect(() => {
    if (isLoading) {
      return; // Wait until authentication check is complete
    }

    if (isAuthenticated && user?.role) {
      // If authenticated, redirect to the user's specific dashboard
      const rolePath = user.role.toLowerCase();
      router.replace(`/${rolePath}`);
    } else {
      // If not authenticated, redirect to the login page
      router.replace('/login');
    }
  }, [user, isAuthenticated, isLoading, router]);

  // Show a loading spinner while the session is being checked and redirection occurs
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <Spinner size="lg" />
    </div>
  );
}
