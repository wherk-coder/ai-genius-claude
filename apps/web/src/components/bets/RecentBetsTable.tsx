'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useBets } from '@/hooks/queries/useBets'
import { ChevronLeft, ChevronRight, Eye, Edit, Trash2 } from 'lucide-react'
import Link from 'next/link'

interface RecentBetsTableProps {
  limit?: number
  showPagination?: boolean
}

export function RecentBetsTable({ limit = 10, showPagination = true }: RecentBetsTableProps) {
  const [page, setPage] = useState(0)
  const offset = page * limit

  const { data: betsData, isLoading } = useBets({
    limit,
    offset,
  })

  const bets = betsData?.bets || []
  const totalCount = betsData?.total || 0
  const totalPages = Math.ceil(totalCount / limit)

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Bets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="h-4 bg-gray-200 rounded animate-pulse flex-1"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!bets || bets.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Bets</CardTitle>
          <CardDescription>Your latest betting activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <div className="text-gray-500">No bets found</div>
            <Link href="/bets/new" className="mt-2 inline-block">
              <Button>Add Your First Bet</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'WON': return 'bg-green-100 text-green-700'
      case 'LOST': return 'bg-red-100 text-red-700'
      case 'PENDING': return 'bg-yellow-100 text-yellow-700'
      case 'PUSHED': return 'bg-gray-100 text-gray-700'
      case 'CANCELLED': return 'bg-gray-100 text-gray-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Bets</CardTitle>
        <CardDescription>
          {totalCount > 0 ? `Showing ${offset + 1}-${Math.min(offset + limit, totalCount)} of ${totalCount} bets` : 'No bets found'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 font-medium text-gray-600">Date</th>
                <th className="text-left py-2 font-medium text-gray-600">Description</th>
                <th className="text-left py-2 font-medium text-gray-600">Type</th>
                <th className="text-left py-2 font-medium text-gray-600">Amount</th>
                <th className="text-left py-2 font-medium text-gray-600">Odds</th>
                <th className="text-left py-2 font-medium text-gray-600">Status</th>
                <th className="text-left py-2 font-medium text-gray-600">P/L</th>
                <th className="text-left py-2 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bets.map((bet: any) => {
                const profitLoss = bet.status === 'WON' 
                  ? bet.potentialPayout - bet.amount 
                  : bet.status === 'LOST' 
                  ? -bet.amount 
                  : 0

                return (
                  <tr key={bet.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 text-sm text-gray-600">
                      {formatDate(bet.createdAt)}
                    </td>
                    <td className="py-3">
                      <div>
                        <div className="font-medium">{bet.description || `${bet.sport} ${bet.type}`}</div>
                        {bet.sport && (
                          <div className="text-sm text-gray-500">{bet.sport}</div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 text-sm">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                        {bet.type}
                      </span>
                    </td>
                    <td className="py-3 font-medium">
                      ${bet.amount.toFixed(2)}
                    </td>
                    <td className="py-3 text-sm text-gray-600">
                      {bet.odds}
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(bet.status)}`}>
                        {bet.status}
                      </span>
                    </td>
                    <td className="py-3 font-medium">
                      {profitLoss !== 0 && (
                        <span className={profitLoss > 0 ? 'text-green-600' : 'text-red-600'}>
                          {profitLoss > 0 ? '+' : ''}${profitLoss.toFixed(2)}
                        </span>
                      )}
                      {profitLoss === 0 && <span className="text-gray-500">-</span>}
                    </td>
                    <td className="py-3">
                      <div className="flex space-x-1">
                        <Link href={`/bets/${bet.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/bets/${bet.id}/edit`}>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {showPagination && totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-600">
              Page {page + 1} of {totalPages}
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page - 1)}
                disabled={page === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={page >= totalPages - 1}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}