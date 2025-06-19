'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface BettingTrendsChartProps {
  data: Array<{
    date: string
    bets: number
    profit: number
    winRate: number
  }>
  isLoading?: boolean
}

export function BettingTrendsChart({ data, isLoading }: BettingTrendsChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Betting Trends</CardTitle>
          <CardDescription>Performance over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Betting Trends</CardTitle>
          <CardDescription>Performance over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-gray-500">
            No data available
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Betting Trends</CardTitle>
        <CardDescription>Your betting performance over the last 30 days</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip
              labelFormatter={(value) => new Date(value).toLocaleDateString()}
              formatter={(value: any, name: string) => {
                if (name === 'profit') return [`$${value.toFixed(2)}`, 'Profit/Loss']
                if (name === 'winRate') return [`${value.toFixed(1)}%`, 'Win Rate']
                return [value, name]
              }}
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="profit"
              stroke="#22c55e"
              strokeWidth={2}
              dot={{ fill: '#22c55e', strokeWidth: 2 }}
              name="profit"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="winRate"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: '#3b82f6', strokeWidth: 2 }}
              name="winRate"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}