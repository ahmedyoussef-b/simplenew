// src/app/(auth)/verify-2fa/page.tsx
import AuthLayout from '@/components/layout/AuthLayout';
import Verify2FAForm from '@/components/auth/Verify2FAForm';

export default function Verify2FAPage() {
    return (
        <AuthLayout
            title="Vérification à Deux Facteurs"
            description="Un code a été envoyé à votre adresse e-mail. Veuillez le saisir ci-dessous."
        >
            <Verify2FAForm />
        </AuthLayout>
    );
}
