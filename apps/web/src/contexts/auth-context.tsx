'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import apiClient from '@/lib/api-client'

interface User {
  id: string
  email: string
  name?: string
  role: 'USER' | 'ADMIN'
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<{ token: string; user: User }>
  register: (data: { email: string; password: string; name?: string }) => Promise<{ token: string; user: User }>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Initialize auth state on mount
  useEffect(() => {
    initializeAuth()
  }, [])

  async function initializeAuth() {
    try {
      // Load token from localStorage
      apiClient.loadToken()
      
      // Try to get user profile if token exists
      if (typeof window !== 'undefined' && localStorage.getItem('auth_token')) {
        const userData = await apiClient.getProfile()
        setUser(userData)
      }
    } catch (error) {
      // If token is invalid, clear it
      apiClient.clearToken()
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  async function login(email: string, password: string) {
    try {
      const result = await apiClient.login(email, password)
      setUser(result.user)
      
      // Store refresh token if provided
      if (typeof window !== 'undefined') {
        localStorage.setItem('user_data', JSON.stringify(result.user))
      }
      
      return result
    } catch (error) {
      throw error
    }
  }

  async function register(data: { email: string; password: string; name?: string }) {
    try {
      const result = await apiClient.register(data)
      setUser(result.user)
      
      // Store user data
      if (typeof window !== 'undefined') {
        localStorage.setItem('user_data', JSON.stringify(result.user))
      }
      
      return result
    } catch (error) {
      throw error
    }
  }

  function logout() {
    apiClient.clearToken()
    setUser(null)
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user_data')
      // Redirect to login page
      window.location.href = '/login'
    }
  }

  async function refreshUser() {
    try {
      const userData = await apiClient.getProfile()
      setUser(userData)
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('user_data', JSON.stringify(userData))
      }
    } catch (error) {
      // If refresh fails, logout user
      logout()
    }
  }

  // Auto-refresh user data every 15 minutes
  useEffect(() => {
    if (user) {
      const interval = setInterval(() => {
        refreshUser()
      }, 15 * 60 * 1000) // 15 minutes

      return () => clearInterval(interval)
    }
  }, [user])

  // Token refresh interceptor (handled in api-client)
  useEffect(() => {
    // Set up axios interceptor to handle 401 responses
    const handleUnauthorized = () => {
      logout()
    }

    // This is handled in the api-client, but we can add additional logic here if needed
  }, [])

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    refreshUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Higher-order component for protected routes
export function withAuth<P extends object>(
  Component: React.ComponentType<P>
) {
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, isLoading } = useAuth()

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      )
    }

    if (!isAuthenticated) {
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
      return null
    }

    return <Component {...props} />
  }
}