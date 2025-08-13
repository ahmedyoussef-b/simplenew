// src/app/page.tsx
import { getServerSession } from '@/lib/auth-utils';
import { redirect } from 'next/navigation';
import LoginPage from './(auth)/login/page';
import { Role } from '@/types';

export default async function RootPage() {
  const session = await getServerSession();
  console.log("➡️ [RootPage] Checking session on server...");

  if (session?.user?.role) {
    const rolePath = session.user.role.toLowerCase();
    console.log(`✅ [RootPage] User authenticated with role ${session.user.role}. Redirecting to /${rolePath}`);
    // Redirect to a temporary page first to test
    switch (session.user.role) {
        case Role.ADMIN:
            return redirect('/temp-admin');
        case Role.TEACHER:
            return redirect('/temp-teacher');
        case Role.STUDENT:
            return redirect('/temp-student');
        case Role.PARENT:
            return redirect('/temp-parent');
        default:
            return redirect('/login');
    }
  }
  
  console.log("🛑 [RootPage] User is not authenticated, showing login page content.");
  // If not authenticated, render the login page content directly.
  return <LoginPage />;
}