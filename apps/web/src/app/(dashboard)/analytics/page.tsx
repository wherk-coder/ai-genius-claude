'use client'

import { BettingTrendsChart } from '@/components/charts/BettingTrendsChart'
import { SportBreakdownChart } from '@/components/charts/SportBreakdownChart'
import { BankrollChart } from '@/components/charts/BankrollChart'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAnalyticsOverview, useBettingTrends, useSportBreakdown, useBankrollHistory, useBetTypeAnalysis } from '@/hooks/queries/useAnalytics'
import { BarChart3, TrendingUp, TrendingDown, Download } from 'lucide-react'
import { useState } from 'react'

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState(30)
  
  const { data: overview, isLoading: overviewLoading } = useAnalyticsOverview()
  const { data: trends, isLoading: trendsLoading } = useBettingTrends(timeRange)
  const { data: sportBreakdown, isLoading: sportsLoading } = useSportBreakdown()
  const { data: bankrollHistory, isLoading: bankrollLoading } = useBankrollHistory(90)
  const { data: betTypeAnalysis, isLoading: betTypesLoading } = useBetTypeAnalysis()

  const timeRangeOptions = [
    { value: 7, label: '7 days' },
    { value: 30, label: '30 days' },
    { value: 90, label: '90 days' },
    { value: 365, label: '1 year' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-gray-600">Detailed insights into your betting performance</p>
        </div>
        <div className="flex space-x-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(Number(e.target.value))}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            {timeRangeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      {overview && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total ROI
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {overview.totalROI ? `${overview.totalROI.toFixed(1)}%` : '0%'}
              </div>
              <p className="text-xs text-gray-500">Return on investment</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Average Bet Size
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${overview.avgBetSize ? overview.avgBetSize.toFixed(2) : '0.00'}
              </div>
              <p className="text-xs text-gray-500">Per bet average</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Longest Streak
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold flex items-center">
                {overview.longestWinStreak || 0}
                <TrendingUp className="ml-2 h-4 w-4 text-green-600" />
              </div>
              <p className="text-xs text-gray-500">Winning streak</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts Row 1 */}
      <div className="grid gap-6 md:grid-cols-2">
        <BettingTrendsChart data={trends} isLoading={trendsLoading} />
        <SportBreakdownChart data={sportBreakdown} isLoading={sportsLoading} />
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-6 md:grid-cols-2">
        <BankrollChart data={bankrollHistory} isLoading={bankrollLoading} />
        
        {/* Bet Types Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Bet Types Performance</CardTitle>
            <CardDescription>Performance by bet type</CardDescription>
          </CardHeader>
          <CardContent>
            {betTypesLoading ? (
              <div className="h-[200px] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : betTypeAnalysis && betTypeAnalysis.length > 0 ? (
              <div className="space-y-4">
                {betTypeAnalysis.map((type: any) => (
                  <div key={type.type} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{type.type}</div>
                      <div className="text-sm text-gray-500">{type.bets} bets</div>
                    </div>
                    <div className="text-right">
                      <div className={`font-medium ${type.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ${type.profit.toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-500">{type.winRate.toFixed(1)}% win rate</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-gray-500">
                No bet type data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Insights */}
      {overview?.insights && overview.insights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Performance Insights</CardTitle>
            <CardDescription>AI-generated recommendations based on your betting patterns</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {overview.insights.map((insight: any, index: number) => (
                <div key={index} className="border-l-4 border-primary-500 pl-4">
                  <h4 className="font-medium">{insight.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
                  {insight.recommendation && (
                    <p className="text-sm text-primary-600 mt-2 font-medium">
                      💡 {insight.recommendation}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}