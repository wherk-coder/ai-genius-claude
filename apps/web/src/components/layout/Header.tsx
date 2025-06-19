'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Menu, X, User, LogOut, Settings } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/contexts/auth-context'

const navigation = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Bets', href: '/bets' },
  { name: 'Analytics', href: '/analytics' },
  { name: 'Receipts', href: '/receipts' },
]

export function Header() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Top">
        <div className="flex w-full items-center justify-between py-4">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold text-primary-600">AI Betting Assistant</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:items-center lg:space-x-6">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'text-sm font-medium transition-colors hover:text-primary-600',
                  pathname === item.href
                    ? 'text-primary-600'
                    : 'text-gray-700'
                )}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Desktop User Menu */}
          <div className="hidden lg:flex lg:items-center lg:space-x-4">
            <Link
              href="/subscription"
              className="text-sm font-medium text-gray-700 hover:text-primary-600"
            >
              Upgrade
            </Link>
            <div className="relative group">
              <button
                className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-primary-600"
              >
                <User className="h-5 w-5" />
                <span>{user?.name || user?.email || 'Account'}</span>
              </button>
              <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="py-1">
                  <Link
                    href="/profile"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Settings className="mr-3 h-4 w-4" />
                    Settings
                  </Link>
                  <button
                    className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-3 h-4 w-4" />
                    Sign out
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex lg:hidden">
            <button
              type="button"
              className="text-gray-700"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Open menu</span>
              {mobileMenuOpen ? (
                <X className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden">
            <div className="space-y-1 pb-3 pt-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'block px-3 py-2 text-base font-medium rounded-md',
                    pathname === item.href
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <Link
                href="/subscription"
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                Upgrade
              </Link>
              <Link
                href="/profile"
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                Settings
              </Link>
              <button
                className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-md"
                onClick={handleLogout}
              >
                Sign out
              </button>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}