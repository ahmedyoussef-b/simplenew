'use client'

import { useRef, useEffect } from 'react'
import { Provider } from 'react-redux'
import { makeStore, type AppStore } from '@/lib/redux/store'
import { useGetSessionQuery } from './api/authApi'
import { setLoading, setUser, logout } from './slices/authSlice'
import { Skeleton } from '@/components/ui/skeleton'

const AuthInitializer = ({ children }: { children: React.ReactNode }) => {
  console.log('🔄 [AuthInitializer] Démarrage du composant...');
  // Use the session query, but the actual state update is handled in authApi.ts
  const { isLoading, isFetching } = useGetSessionQuery();
  console.log(`🔄 [AuthInitializer] État de la session: isLoading: ${isLoading}, isFetching: ${isFetching}`);

  // Show a loading skeleton while the initial session is being fetched.
  if (isLoading || isFetching) {
    console.log('⏳ [AuthInitializer] Affichage du Skeleton pendant la récupération de la session.');
    return (
        <div className="flex min-h-screen flex-col items-center justify-center">
            <div className="space-y-4">
                <Skeleton className="h-12 w-96" />
                <Skeleton className="h-8 w-80" />
                <div className="flex justify-center gap-4 pt-4">
                    <Skeleton className="h-10 w-24" />
                    <Skeleton className="h-10 w-24" />
                </div>
            </div>
        </div>
    );
  }
  
  console.log('✅ [AuthInitializer] Initialisation terminée, affichage des enfants.');
  return <>{children}</>;
}


export default function StoreProvider({
  children,
}: {
  children: React.ReactNode
}) {
  console.log('--- ⚛️ [StoreProvider] Rendu ---');
  const storeRef = useRef<AppStore | null>(null)
  if (!storeRef.current) {
    console.log('✨ [StoreProvider] Création d\'une nouvelle instance du store Redux.');
    // Create the store instance the first time this renders
    storeRef.current = makeStore()
    // Start initial session check by setting loading state
    console.log('🚀 [StoreProvider] Dispatch de setLoading(true) pour démarrer la vérification de session.');
    storeRef.current.dispatch(setLoading(true));
  }
  
  return (
    <Provider store={storeRef.current}>
      <AuthInitializer>{children}</AuthInitializer>
    </Provider>
  )
}
