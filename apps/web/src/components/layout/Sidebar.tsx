'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Trophy,
  BarChart3,
  Receipt,
  CreditCard,
  Settings,
  HelpCircle,
  TrendingUp,
  Users,
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'My Bets', href: '/bets', icon: Trophy },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Receipts', href: '/receipts', icon: Receipt },
  { name: 'Trends', href: '/trends', icon: TrendingUp },
  { name: 'Leaderboard', href: '/leaderboard', icon: Users },
]

const secondaryNavigation = [
  { name: 'Subscription', href: '/subscription', icon: CreditCard },
  { name: 'Settings', href: '/settings', icon: Settings },
  { name: 'Help', href: '/help', icon: HelpCircle },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col bg-gray-50 border-r border-gray-200">
      <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
        <div className="flex flex-shrink-0 items-center px-4">
          <span className="text-xl font-bold text-primary-600">AI Betting</span>
        </div>
        <nav className="mt-8 flex-1 space-y-1 px-2">
          <div>
            <h3 className="px-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
              Main
            </h3>
            <div className="mt-2 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                      pathname === item.href
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    )}
                  >
                    <Icon
                      className={cn(
                        'mr-3 h-5 w-5 flex-shrink-0 transition-colors',
                        pathname === item.href
                          ? 'text-primary-600'
                          : 'text-gray-400 group-hover:text-gray-500'
                      )}
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </div>

          <div className="mt-8">
            <h3 className="px-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
              Account
            </h3>
            <div className="mt-2 space-y-1">
              {secondaryNavigation.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                      pathname === item.href
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    )}
                  >
                    <Icon
                      className={cn(
                        'mr-3 h-5 w-5 flex-shrink-0 transition-colors',
                        pathname === item.href
                          ? 'text-primary-600'
                          : 'text-gray-400 group-hover:text-gray-500'
                      )}
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </div>
        </nav>
      </div>
      
      {/* User info */}
      <div className="flex flex-shrink-0 border-t border-gray-200 p-4">
        <div className="flex items-center">
          <div>
            <div className="text-sm font-medium text-gray-900">John Doe</div>
            <div className="text-xs text-gray-500">Pro Plan</div>
          </div>
        </div>
      </div>
    </div>
  )
}