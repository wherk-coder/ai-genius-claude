'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface SportBreakdownChartProps {
  data: Array<{
    sport: string
    bets: number
    profit: number
    winRate: number
  }>
  isLoading?: boolean
}

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316']

export function SportBreakdownChart({ data, isLoading }: SportBreakdownChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sport Performance</CardTitle>
          <CardDescription>Breakdown by sport</CardDescription>
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
          <CardTitle>Sport Performance</CardTitle>
          <CardDescription>Breakdown by sport</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-gray-500">
            No data available
          </div>
        </CardContent>
      </Card>
    )
  }

  const pieData = data.map((item, index) => ({
    name: item.sport,
    value: item.bets,
    profit: item.profit,
    winRate: item.winRate,
    color: COLORS[index % COLORS.length],
  }))

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-gray-600">Bets: {data.value}</p>
          <p className="text-sm text-gray-600">Profit: ${data.profit?.toFixed(2)}</p>
          <p className="text-sm text-gray-600">Win Rate: {data.winRate?.toFixed(1)}%</p>
        </div>
      )
    }
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sport Performance</CardTitle>
        <CardDescription>Your betting activity broken down by sport</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        
        {/* Stats below chart */}
        <div className="mt-4 grid grid-cols-1 gap-2">
          {data.map((sport, index) => (
            <div key={sport.sport} className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span>{sport.sport}</span>
              </div>
              <div className="flex space-x-4 text-gray-600">
                <span>{sport.bets} bets</span>
                <span className={sport.profit >= 0 ? 'text-green-600' : 'text-red-600'}>
                  ${sport.profit?.toFixed(2)}
                </span>
                <span>{sport.winRate?.toFixed(1)}%</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}