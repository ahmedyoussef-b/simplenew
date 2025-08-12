'use client';

import { useAppSelector } from '@/lib/redux/hooks';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useLogoutMutation } from '@/lib/redux/api/authApi';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';


export default function Home() {
  const { isAuthenticated, user, isLoading } = useAppSelector((state) => state.auth);
  const [logout] = useLogoutMutation();
  const router = useRouter();

  useEffect(() => {
    console.log('🔄 [Accueil] Vérification de l\'état: isLoading:', isLoading, 'isAuthenticated:', isAuthenticated);
    // Redirect to the dashboard if the user is authenticated and loading is finished
    if (!isLoading && isAuthenticated) {
      console.log('✅ [Accueil] Authentifié, redirection vers /dashboard');
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  const handleLogout = async () => {
    console.log('👋 [Accueil] Déconnexion...');
    try {
        await logout().unwrap();
        // The Redux slice will clear the user state.
        // We push to the homepage after logout.
        router.push('/');
    } catch (error) {
        console.error("❌ Échec de la déconnexion:", error)
    }
  };

  // Display a loading state while checking the session
  if (isLoading) {
    console.log('⏳ [Accueil] Session en cours de vérification, affichage du Skeleton...');
    return (
        <div className="flex min-h-screen flex-col items-center justify-center">
            <div className="space-y-4">
                <Skeleton className="h-12 w-96" />
                <Skeleton className="h-8 w-80" />
                <Skeleton className="h-10 w-32" />
            </div>
        </div>
    );
  }

  // If the user is authenticated, this page will redirect.
  // We can return null or a minimal loader to avoid a flash of content.
  if (isAuthenticated) {
      console.log('👻 [Accueil] Authentifié, rendu nul en attente de redirection.');
      return null;
  }

  console.log('🚪 [Accueil] Affichage de la page pour les non-authentifiés.');
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-8 text-center">
      <div className="max-w-4xl">
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl md:text-7xl font-headline text-foreground">
          Welcome to SimplePage
        </h1>
        <p className="mt-6 text-lg leading-8 text-muted-foreground">
          This is a simple, elegant, and responsive page built with Next.js, Tailwind CSS, and ShadCN UI. 
          It's designed to be a clean starting point for your new application, featuring a calming blue color palette 
          and the modern 'Inter' typeface.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
            {!isAuthenticated ? (
                <>
                    <Link href="/login">
                        <Button>Login</Button>
                    </Link>
                    <Link href="/register">
                        <Button variant="outline">Sign Up</Button>
                    </Link>
                </>
            ) : (
                <>
                    <Link href="/dashboard">
                        <Button>Go to Dashboard</Button>
                    </Link>
                    <Button onClick={handleLogout} variant="destructive">
                        Logout
                    </Button>
                </>
            )}
        </div>
      </div>
    </main>
  );
}
