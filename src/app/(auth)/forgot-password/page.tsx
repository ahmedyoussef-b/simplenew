// src/app/(auth)/forgot-password/page.tsx
import AuthLayout from '@/components/layout/AuthLayout';
import {ForgotPasswordForm} from '@/components/auth/ForgotPasswordForm';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  return (
    <AuthLayout
      title="Forgot your password?"
      description="Enter your email and we'll send you a link to get back into your account."
    >
      <ForgotPasswordForm />
      <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
        Remembered your password?{' '}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
