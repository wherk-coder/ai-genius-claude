'use client'

import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'
import { Footer } from '@/components/layout/Footer'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { AuthProvider } from '@/contexts/auth-context'
import { QueryProvider } from '@/providers/query-provider'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <QueryProvider>
      <AuthProvider>
        <ProtectedRoute>
          <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <Header />
            
            <div className="flex">
              {/* Sidebar */}
              <Sidebar />
              
              {/* Main content */}
              <main className="flex-1 min-h-screen">
                <div className="p-6">
                  {children}
                </div>
              </main>
            </div>
            
            {/* Footer */}
            <Footer />
          </div>
        </ProtectedRoute>
      </AuthProvider>
    </QueryProvider>
  )
}