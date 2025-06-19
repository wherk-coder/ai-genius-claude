'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAnalyticsOverview, useBettingTrends } from '@/hooks/queries/useAnalytics'
import { useBetStats } from '@/hooks/queries/useBets'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Target, 
  BarChart3, 
  Plus,
  Trophy,
  AlertCircle 
} from 'lucide-react'
import Link from 'next/link'
import { RecentBetsTable } from '@/components/bets/RecentBetsTable'

export default function DashboardPage() {
  const { data: overview, isLoading: overviewLoading } = useAnalyticsOverview()
  const { data: betStats, isLoading: statsLoading } = useBetStats()
  const { data: trends, isLoading: trendsLoading } = useBettingTrends(7) // Last 7 days

  const isLoading = overviewLoading || statsLoading || trendsLoading

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const stats = [
    {
      title: 'Total Bets',
      value: betStats?.totalBets || 0,
      change: betStats?.betsThisWeek || 0,
      changeLabel: 'this week',
      icon: Target,
      color: 'blue',
    },
    {
      title: 'Win Rate',
      value: betStats ? `${((betStats.wonBets / betStats.totalBets) * 100).toFixed(1)}%` : '0%',
      change: betStats?.winRateChange || 0,
      changeLabel: 'vs last week',
      icon: Trophy,
      color: 'green',
    },
    {
      title: 'Total Profit/Loss',
      value: betStats ? `$${betStats.totalProfitLoss?.toFixed(2) || '0.00'}` : '$0.00',
      change: betStats?.profitLossChange || 0,
      changeLabel: 'this week',
      icon: DollarSign,
      color: betStats?.totalProfitLoss >= 0 ? 'green' : 'red',
    },
    {
      title: 'Active Bets',
      value: betStats?.pendingBets || 0,
      change: 0,
      changeLabel: 'pending',
      icon: BarChart3,
      color: 'yellow',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's your betting overview.</p>
        </div>
        <div className="flex space-x-2">
          <Link href="/bets/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Bet
            </Button>
          </Link>
          <Link href="/receipts/upload">
            <Button variant="outline">
              Upload Receipt
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          const isPositive = stat.change >= 0
          const changeColor = isPositive ? 'text-green-600' : 'text-red-600'
          const TrendIcon = isPositive ? TrendingUp : TrendingDown

          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4 w-4 text-${stat.color}-600`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                {stat.change !== 0 && (
                  <p className={`text-xs ${changeColor} flex items-center`}>
                    <TrendIcon className="mr-1 h-3 w-3" />
                    {Math.abs(stat.change)} {stat.changeLabel}
                  </p>
                )}
                {stat.change === 0 && (
                  <p className="text-xs text-gray-500">{stat.changeLabel}</p>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Recent Bets Table */}
      <RecentBetsTable limit={5} showPagination={false} />

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        <div></div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and tools</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              <Link href="/bets/new">
                <Button variant="outline" className="w-full justify-start">
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Bet
                </Button>
              </Link>
              <Link href="/receipts/upload">
                <Button variant="outline" className="w-full justify-start">
                  <Target className="mr-2 h-4 w-4" />
                  Scan Receipt
                </Button>
              </Link>
              <Link href="/analytics">
                <Button variant="outline" className="w-full justify-start">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  View Analytics
                </Button>
              </Link>
              <Link href="/subscription">
                <Button variant="outline" className="w-full justify-start">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Upgrade Plan
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Insights */}
      {overview?.insights && overview.insights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>AI Insights</CardTitle>
            <CardDescription>Personalized recommendations based on your betting patterns</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {overview.insights.slice(0, 3).map((insight: any, index: number) => (
                <div key={index} className="border-l-4 border-primary-500 pl-4">
                  <h4 className="font-medium">{insight.title}</h4>
                  <p className="text-sm text-gray-600">{insight.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}