'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useBets, useDeleteBet } from '@/hooks/queries/useBets'
import { BulkActions, SelectableBetRow } from '@/components/bets/BulkActions'
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  Download,
  SortAsc,
  SortDesc
} from 'lucide-react'
import Link from 'next/link'

const SPORTS = ['All', 'NFL', 'NBA', 'MLB', 'NHL', 'NCAAF', 'NCAAB', 'Soccer', 'Tennis', 'Golf', 'MMA', 'Boxing', 'Other']
const STATUSES = ['All', 'PENDING', 'WON', 'LOST', 'PUSHED', 'CANCELLED']
const BET_TYPES = ['All', 'STRAIGHT', 'PARLAY', 'PROP']

export default function BetsPage() {
  const [page, setPage] = useState(0)
  const [filters, setFilters] = useState({
    sport: 'All',
    status: 'All',
    type: 'All',
    search: '',
    startDate: '',
    endDate: '',
  })
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'profit'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedBets, setSelectedBets] = useState<string[]>([])

  const limit = 20
  const offset = page * limit

  // Build query filters
  const queryFilters: any = {
    limit,
    offset,
  }

  if (filters.sport !== 'All') queryFilters.sport = filters.sport
  if (filters.status !== 'All') queryFilters.status = filters.status
  if (filters.startDate) queryFilters.startDate = filters.startDate
  if (filters.endDate) queryFilters.endDate = filters.endDate

  const { data: betsData, isLoading } = useBets(queryFilters)
  const deleteBetMutation = useDeleteBet()

  const bets = betsData?.bets || []
  const totalCount = betsData?.total || 0
  const totalPages = Math.ceil(totalCount / limit)

  const handleDeleteBet = async (betId: string) => {
    if (confirm('Are you sure you want to delete this bet?')) {
      await deleteBetMutation.mutateAsync(betId)
    }
  }

  const handleSort = (field: 'date' | 'amount' | 'profit') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
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

  // Filter and sort bets client-side for search and type filters
  let filteredBets = bets
  
  if (filters.search) {
    filteredBets = filteredBets.filter((bet: any) =>
      bet.description?.toLowerCase().includes(filters.search.toLowerCase()) ||
      bet.sport?.toLowerCase().includes(filters.search.toLowerCase())
    )
  }

  if (filters.type !== 'All') {
    filteredBets = filteredBets.filter((bet: any) => bet.type === filters.type)
  }

  // Sort bets
  filteredBets.sort((a: any, b: any) => {
    let aValue, bValue
    
    switch (sortBy) {
      case 'date':
        aValue = new Date(a.createdAt).getTime()
        bValue = new Date(b.createdAt).getTime()
        break
      case 'amount':
        aValue = a.amount
        bValue = b.amount
        break
      case 'profit':
        aValue = a.status === 'WON' ? a.potentialPayout - a.amount : a.status === 'LOST' ? -a.amount : 0
        bValue = b.status === 'WON' ? b.potentialPayout - b.amount : b.status === 'LOST' ? -b.amount : 0
        break
      default:
        return 0
    }
    
    return sortOrder === 'asc' ? aValue - bValue : bValue - aValue
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Bets</h1>
          <p className="text-gray-600">
            {totalCount > 0 ? `${totalCount} total bets` : 'No bets found'}
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Link href="/bets/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Bet
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Filters & Search</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="mr-2 h-4 w-4" />
              {showFilters ? 'Hide' : 'Show'} Filters
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="flex items-center space-x-2 mb-4">
            <Search className="h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search bets..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="max-w-md"
            />
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="grid gap-4 md:grid-cols-5">
              <div className="space-y-2">
                <Label>Sport</Label>
                <select
                  value={filters.sport}
                  onChange={(e) => setFilters({ ...filters, sport: e.target.value })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                >
                  {SPORTS.map((sport) => (
                    <option key={sport} value={sport}>
                      {sport}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                >
                  {STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label>Bet Type</Label>
                <select
                  value={filters.type}
                  onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                >
                  {BET_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      <BulkActions 
        bets={filteredBets}
        selectedBets={selectedBets}
        onSelectionChange={setSelectedBets}
      />

      {/* Bets Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6">
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <div className="h-4 bg-gray-200 rounded animate-pulse flex-1"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
                  </div>
                ))}
              </div>
            </div>
          ) : filteredBets.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 w-12">
                      Select
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      <button
                        onClick={() => handleSort('date')}
                        className="flex items-center space-x-1 hover:text-gray-900"
                      >
                        <span>Date</span>
                        {sortBy === 'date' && (
                          sortOrder === 'asc' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />
                        )}
                      </button>
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Description</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Type</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      <button
                        onClick={() => handleSort('amount')}
                        className="flex items-center space-x-1 hover:text-gray-900"
                      >
                        <span>Amount</span>
                        {sortBy === 'amount' && (
                          sortOrder === 'asc' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />
                        )}
                      </button>
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Odds</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      <button
                        onClick={() => handleSort('profit')}
                        className="flex items-center space-x-1 hover:text-gray-900"
                      >
                        <span>P/L</span>
                        {sortBy === 'profit' && (
                          sortOrder === 'asc' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />
                        )}
                      </button>
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBets.map((bet: any) => {
                    const profitLoss = bet.status === 'WON' 
                      ? bet.potentialPayout - bet.amount 
                      : bet.status === 'LOST' 
                      ? -bet.amount 
                      : 0

                    return (
                      <SelectableBetRow 
                        key={bet.id}
                        bet={bet}
                        isSelected={selectedBets.includes(bet.id)}
                        onSelectionChange={(betId) => {
                          if (selectedBets.includes(betId)) {
                            setSelectedBets(selectedBets.filter(id => id !== betId))
                          } else {
                            setSelectedBets([...selectedBets, betId])
                          }
                        }}
                      >
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {formatDate(bet.createdAt)}
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-medium">{bet.description || `${bet.sport} ${bet.type}`}</div>
                            {bet.sport && (
                              <div className="text-sm text-gray-500">{bet.sport}</div>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm">
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                            {bet.type}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-medium">
                          ${bet.amount.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {bet.odds}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(bet.status)}`}>
                            {bet.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-medium">
                          {profitLoss !== 0 && (
                            <span className={profitLoss > 0 ? 'text-green-600' : 'text-red-600'}>
                              {profitLoss > 0 ? '+' : ''}${profitLoss.toFixed(2)}
                            </span>
                          )}
                          {profitLoss === 0 && <span className="text-gray-500">-</span>}
                        </td>
                        <td className="py-3 px-4">
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
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleDeleteBet(bet.id)}
                              disabled={deleteBetMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </SelectableBetRow>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-500 mb-4">No bets found matching your criteria</div>
              <Link href="/bets/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Bet
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {offset + 1}-{Math.min(offset + limit, totalCount)} of {totalCount} bets
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
            <div className="flex items-center space-x-1">
              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                const pageNum = Math.max(0, Math.min(page - 2 + i, totalPages - 1))
                return (
                  <Button
                    key={pageNum}
                    variant={page === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPage(pageNum)}
                  >
                    {pageNum + 1}
                  </Button>
                )
              })}
            </div>
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
    </div>
  )
}