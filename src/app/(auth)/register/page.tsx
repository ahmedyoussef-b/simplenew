// src/app/(auth)/register/page.tsx
import AuthLayout from '@/components/layout/AuthLayout';
import {RegisterForm} from '@/components/auth/RegisterForm';
import Link from 'next/link';

export default function RegisterPage() {
  return (
    <AuthLayout
      title="Create an account"
      description="Join our platform as a Parent or a Teacher."
    >
      <RegisterForm />
      <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
