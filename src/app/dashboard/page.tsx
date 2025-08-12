// src/app/dashboard/page.tsx
'use client';

import { useAppSelector } from '@/lib/redux/hooks';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useLogoutMutation } from '@/lib/redux/api/authApi';

const DashboardPage = () => {
    const { user, isLoading } = useAppSelector((state) => state.auth);
    const router = useRouter();
    const [logout] = useLogoutMutation();

    useEffect(() => {
        console.log('🔄 [Dashboard] Vérification de l\'état: isLoading:', isLoading, 'user:', !!user);
        if (!isLoading && !user) {
            console.log('🛑 [Dashboard] Non authentifié, redirection vers /login');
            router.push('/login');
        }
    }, [user, isLoading, router]);

    const handleLogout = async () => {
        console.log('👋 [Dashboard] Déconnexion...');
        try {
            await logout().unwrap();
            router.push('/');
        } catch (error) {
            console.error("❌ Échec de la déconnexion depuis le dashboard:", error)
        }
    };

    if (isLoading) {
        console.log('⏳ [Dashboard] Affichage du loader...');
        return <div>Loading...</div>;
    }
    
    if (!user) {
        console.log('👻 [Dashboard] Pas d\'utilisateur, rendu nul (redirection en cours).');
        return null;
    }

    console.log(`🎉 [Dashboard] Affichage pour l'utilisateur: ${user.name}`);
    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Dashboard</h1>
                <Button onClick={handleLogout} variant="destructive">
                    Logout
                </Button>
            </div>
            <p>Welcome, {user.name}!</p>
            <p>Your role is: {user.role}</p>
            <p>This is a generic dashboard. You can add role-specific components here.</p>
        </div>
    );
};

export default DashboardPage;
