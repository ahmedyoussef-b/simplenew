// src/app/(auth)/layout.tsx
import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/auth-utils';

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession();

  // If a session exists, redirect the user to their respective dashboard.
  if (session?.user?.role) {
    redirect(`/${session.user.role.toLowerCase()}`);
  }
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  )
}
