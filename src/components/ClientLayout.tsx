'use client'

import { NavigationProvider } from '@/contexts/NavigationContext'
import { AdminAuthProvider } from '@/contexts/AdminAuthContext'
import { BottomNavigation } from '@/components/BottomNavigation'
import { Header } from '@/components/Header'

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthProvider>
      <NavigationProvider>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1 pt-16 md:pt-20 pb-24 md:pb-6">
            {children}
          </main>
          <BottomNavigation />
        </div>
      </NavigationProvider>
    </AdminAuthProvider>
  )
}
