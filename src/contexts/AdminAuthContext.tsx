'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface AdminAuthContextType {
  isAuthenticated: boolean
  login: (password: string) => boolean
  logout: () => void
  showLoginModal: boolean
  setShowLoginModal: (show: boolean) => void
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined)

const ADMIN_PASSWORD = 'Admin123'

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)

  // Check localStorage and sync state
  useEffect(() => { /* eslint-disable react-hooks/set-state-in-effect */
    const savedAuth = localStorage.getItem('adminAuthenticated')
    const isAuth = savedAuth === 'true'
    
    // Use callback pattern to avoid setState in effect body
    setIsAuthenticated((prev) => {
      if (prev !== isAuth) {
        return isAuth
      }
      return prev
    })
  }, [])

  const login = (password: string): boolean => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true)
      localStorage.setItem('adminAuthenticated', 'true')
      setShowLoginModal(false)
      return true
    }
    return false
  }

  const logout = () => {
    setIsAuthenticated(false)
    localStorage.removeItem('adminAuthenticated')
  }

  return (
    <AdminAuthContext.Provider value={{ isAuthenticated, login, logout, showLoginModal, setShowLoginModal }}>
      {children}
    </AdminAuthContext.Provider>
  )
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext)
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider')
  }
  return context
}
