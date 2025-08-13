// src/app/(dashboard)/dashboard/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/hooks/redux-hooks';
import { selectCurrentUser, selectIsAuthLoading } from '@/lib/redux/slices/authSlice';
import { Spinner } from '@/components/ui/spinner';
import { Role } from '@/types';

export default function DashboardRedirectPage() {
  const router = useRouter();
  const user = useAppSelector(selectCurrentUser);
  const isLoading = useAppSelector(selectIsAuthLoading);

  useEffect(() => {
    console.log("🔄 [DashboardRedirect] useEffect triggered. isLoading:", isLoading, "User:", user?.email);
    if (isLoading) {
      console.log("⏳ [DashboardRedirect] Auth state is loading, waiting...");
      return;
    }

    if (user?.role) {
      const rolePath = user.role.toLowerCase();
      console.log(`✅ [DashboardRedirect] User authenticated with role ${user.role}. Redirecting to /${rolePath}`);
      router.replace(`/${rolePath}`);

    } else {
      console.log(`🛑 [DashboardRedirect] User not authenticated. Redirecting to /login`);
      router.replace('/login');
    }
  }, [user, isLoading, router]);

  // Show a loading spinner while the session is being checked and redirection occurs
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <Spinner size="lg" />
    </div>
  );
}
