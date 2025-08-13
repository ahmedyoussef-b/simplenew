// src/app/(auth)/reset-password/page.tsx
'use client'

import AuthLayout from '@/components/layout/AuthLayout';
import {ResetPasswordForm} from '@/components/auth/ResetPasswordForm';
import { Suspense } from 'react';

function ResetPasswordContent() {
  return (
    <AuthLayout
      title="Reset your password"
      description="Enter a new password for your account below."
    >
      <ResetPasswordForm token={''} />
    </AuthLayout>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
