// src/app/(auth)/verify-2fa/page.tsx
'use client';
import AuthLayout from '@/components/layout/AuthLayout';
import Verify2FAForm from '@/components/auth/Verify2FAForm';
import { Suspense } from 'react';

function Verify2FAPageContent() {
    return (
        <AuthLayout
            title="Two-Factor Authentication"
            description="Enter the code from your authenticator app to continue."
        >
            <Verify2FAForm />
        </AuthLayout>
    );
}


export default function Verify2FAPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <Verify2FAPageContent/>
        </Suspense>
    )
}
