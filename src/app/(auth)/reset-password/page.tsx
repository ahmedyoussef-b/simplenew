// src/app/(auth)/reset-password/page.tsx
import AuthLayout from '@/components/layout/AuthLayout';
import ResetPasswordForm from '@/components/auth/ResetPasswordForm';

export default function ResetPasswordPage() {
    return (
        <AuthLayout
            title="Réinitialiser le Mot de Passe"
            description="Choisissez un nouveau mot de passe sécurisé."
        >
            <ResetPasswordForm />
        </AuthLayout>
    );
}
