'use client'

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface BankrollChartProps {
  data: Array<{
    date: string
    balance: number
    deposits: number
    withdrawals: number
  }>
  isLoading?: boolean
}

export function BankrollChart({ data, isLoading }: BankrollChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Bankroll History</CardTitle>
          <CardDescription>Your bankroll over time</CardDescription>
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
          <CardTitle>Bankroll History</CardTitle>
          <CardDescription>Your bankroll over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-gray-500">
            No data available
          </div>
        </CardContent>
      </Card>
    )
  }

  const currentBalance = data[data.length - 1]?.balance || 0
  const startBalance = data[0]?.balance || 0
  const totalChange = currentBalance - startBalance
  const percentChange = startBalance > 0 ? (totalChange / startBalance) * 100 : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Bankroll History</span>
          <div className="text-right">
            <div className="text-2xl font-bold">${currentBalance.toFixed(2)}</div>
            <div className={`text-sm ${totalChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {totalChange >= 0 ? '+' : ''}${totalChange.toFixed(2)} ({percentChange.toFixed(1)}%)
            </div>
          </div>
        </CardTitle>
        <CardDescription>Track your betting bankroll over the last 90 days</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            />
            <YAxis 
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip
              labelFormatter={(value) => new Date(value).toLocaleDateString()}
              formatter={(value: any, name: string) => {
                return [`$${value.toFixed(2)}`, name === 'balance' ? 'Balance' : name]
              }}
            />
            <Area
              type="monotone"
              dataKey="balance"
              stroke="#3b82f6"
              fillOpacity={1}
              fill="url(#colorBalance)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
        
        {/* Summary stats */}
        <div className="mt-4 grid grid-cols-3 gap-4 text-center border-t pt-4">
          <div>
            <div className="text-sm text-gray-600">Starting Balance</div>
            <div className="font-medium">${startBalance.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Current Balance</div>
            <div className="font-medium">${currentBalance.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Total Change</div>
            <div className={`font-medium ${totalChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {totalChange >= 0 ? '+' : ''}${totalChange.toFixed(2)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}