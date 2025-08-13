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

export default function RootPage() {
  const router = useRouter();
  const user = useAppSelector(selectCurrentUser);
  const isLoading = useAppSelector(selectIsAuthLoading);

  useEffect(() => {
    if (isLoading) {
      return;
    }
    if (user?.role) {
      router.replace('/dashboard');
    }
    // If not authenticated, we will render the login form directly on this page
    // instead of redirecting, to avoid redirection loops.
  }, [user, isLoading, router]);

  // If we are still loading the session or if the user is authenticated and redirection is in progress, show a spinner.
  if (isLoading || user) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  // If not loading and no user, render the login form directly on the root page.
  return (
      <AuthLayout
        title="Sign in to your account"
        description="Enter your credentials to access your dashboard."
      >
        <LoginForm />
        <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
          Don't have an account?{' '}
          <Link href="/register" className="font-medium text-primary hover:underline">
            Sign up
          </Link>
        </p>
      </AuthLayout>
  );
}
