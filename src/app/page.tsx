// src/app/page.tsx
import { getServerSession } from '@/lib/auth-utils';
import { redirect } from 'next/navigation';
import LoginPage from './(auth)/login/page';

export default async function RootPage() {
  const session = await getServerSession();

  if (session?.user?.role) {
    const rolePath = session.user.role.toLowerCase();
    console.log(`✅ [RootPage] User authenticated with role ${session.user.role}. Redirecting to /${rolePath}`);
    // Redirect to the role-specific dashboard if authenticated
    return redirect(`/${rolePath}`);
  }
  
  console.log("🛑 [RootPage] User is not authenticated, showing login page content.");
  // If not authenticated, render the login page content directly.
  return <LoginPage />;
}
