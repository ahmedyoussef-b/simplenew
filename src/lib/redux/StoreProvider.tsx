'use client'

import { useRef } from 'react'
import { Provider } from 'react-redux'
import { makeStore, type AppStore } from '@/lib/redux/store'
import { useGetSessionQuery } from './api/authApi'
import { Skeleton } from '@/components/ui/skeleton'

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  // Trigger the session query on initial load.
  // The onQueryStarted listener in authApi will handle dispatching setUser/logout.
  const { isLoading } = useGetSessionQuery();

  if (isLoading) {
    console.log('⏳ [AuthProvider] Session check in progress, showing Skeleton...');
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

  console.log('✅ [AuthProvider] Session check complete, rendering app.');
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
    storeRef.current = makeStore()
  }
  
  return (
    <Provider store={storeRef.current}>
      <AuthProvider>{children}</AuthProvider>
    </Provider>
  )
}
