// src/lib/redux/StoreProvider.tsx
'use client'

import { Provider } from 'react-redux'
import { store } from './store'
import { useGetSessionQuery } from './api/authApi'
import { useEffect } from 'react'

function AuthInitializer({ children }: { children: React.ReactNode }) {
    // This hook ensures that on initial load, we make a request to check the session.
    // The onQueryStarted listener in the authApi will then dispatch setUser or logout.
    useGetSessionQuery();
    
    // Render children immediately; loading states are handled by individual pages.
    return <>{children}</>;
}


export default function StoreProvider({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Provider store={store}>
      <AuthInitializer>{children}</AuthInitializer>
    </Provider>
  )
}
