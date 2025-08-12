'use client'

import { useRef, useEffect } from 'react'
import { Provider } from 'react-redux'
import { makeStore, type AppStore } from '@/lib/redux/store'
import { useGetSessionQuery } from './api/authApi'
import { setLoading } from './slices/authSlice'

const AuthInitializer = ({ children }: { children: React.ReactNode }) => {
  const { data, isLoading, isFetching } = useGetSessionQuery();

  // The session is being fetched, show a loader or nothing
  if (isLoading || isFetching) {
    return <div>Loading session...</div>;
  }
  
  return <>{children}</>;
}


export default function StoreProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const storeRef = useRef<AppStore | null>(null)
  if (!storeRef.current) {
    // Create the store instance the first time this renders
    storeRef.current = makeStore()
    // Start initial session check
    storeRef.current.dispatch(setLoading(true));
  }
  
  return (
    <Provider store={storeRef.current}>
      <AuthInitializer>{children}</AuthInitializer>
    </Provider>
  )
}
