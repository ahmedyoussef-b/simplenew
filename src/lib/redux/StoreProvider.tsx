'use client'

import { useRef } from 'react'
import { Provider } from 'react-redux'
import { makeStore, type AppStore } from '@/lib/redux/store'
import { useGetSessionQuery } from './api/authApi'

// This component ensures the session is checked on initial load
function AuthInitializer({ children }: { children: React.ReactNode }) {
    // Trigger the session query on initial load.
    // The onQueryStarted listener in authApi will handle dispatching setUser/logout.
    useGetSessionQuery();
    // Render children immediately; loading states are handled by individual pages.
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
      <AuthInitializer>{children}</AuthInitializer>
    </Provider>
  )
}
