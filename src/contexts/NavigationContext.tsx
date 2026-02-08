'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

type View = 'products' | 'search' | 'orders' | 'storeInfo' | 'checkout' | 'admin'

interface NavigationContextType {
  view: View
  setView: (view: View) => void
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined)

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [view, setView] = useState<View>('products')

  return (
    <NavigationContext.Provider value={{ view, setView }}>
      {children}
    </NavigationContext.Provider>
  )
}

export function useNavigation() {
  const context = useContext(NavigationContext)
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider')
  }
  return context
}
