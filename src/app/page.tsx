// src/app/page.tsx
import { getServerSession } from '@/lib/auth-utils';
import { redirect } from 'next/navigation';
import AccueilPage from './accueil/page';

export default async function RootPage() {
  const session = await getServerSession();

  if (session?.user?.role) {
    // If the user is logged in, redirect them to their specific dashboard entry point.
    // The /dashboard route will then handle role-based redirection.
    return redirect('/dashboard');
  }

  // If the user is not logged in, show the public landing page.
  return <AccueilPage />;
}
