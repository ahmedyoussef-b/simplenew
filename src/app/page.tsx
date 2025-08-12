'use client';

import { useAppSelector } from '@/lib/redux/hooks';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useLogoutMutation } from '@/lib/redux/api/authApi';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const [logout] = useLogoutMutation();
  const router = useRouter();

  const handleLogout = async () => {
    await logout().unwrap();
    router.push('/');
  };

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
          {isAuthenticated ? (
            <>
              <p className="text-lg">Welcome, {user?.name || 'User'}!</p>
              <Button onClick={handleLogout}>Logout</Button>
              <Link href="/dashboard">
                <Button variant="outline">Go to Dashboard</Button>
              </Link>
            </>
          ) : (
            <Link href="/login">
              <Button>Login</Button>
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}
