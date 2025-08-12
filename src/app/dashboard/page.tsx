// src/app/dashboard/page.tsx
'use client';

import { useAppSelector } from '@/lib/redux/hooks';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const DashboardPage = () => {
    const { user, isLoading } = useAppSelector((state) => state.auth);
    const router = useRouter();

    useEffect(() => {
        console.log('🔄 [Dashboard] Vérification de l\'état: isLoading:', isLoading, 'user:', !!user);
        if (!isLoading && !user) {
            console.log('🛑 [Dashboard] Non authentifié, redirection vers /login');
            router.push('/login');
        }
    }, [user, isLoading, router]);

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
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p>Welcome, {user.name}!</p>
            <p>Your role is: {user.role}</p>
            <p>This is a generic dashboard. You can add role-specific components here.</p>
        </div>
    );
};

export default DashboardPage;
