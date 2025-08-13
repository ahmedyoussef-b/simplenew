// src/app/(auth)/login/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// This page now simply redirects to the root page,
// which handles displaying the login form if not authenticated.
export default function LoginPage() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace('/');
  }, [router]);

  return null;
}