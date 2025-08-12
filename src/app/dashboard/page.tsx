// src/app/dashboard/page.tsx
'use client';

import { useAppSelector } from '@/lib/redux/hooks';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const DashboardPage = () => {
    const { user, isLoading } = useAppSelector((state) => state.auth);
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/login');
        }
    }, [user, isLoading, router]);

    if (isLoading) {
        return <div>Loading...</div>;
    }
    
    if (!user) {
        return null;
    }

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
