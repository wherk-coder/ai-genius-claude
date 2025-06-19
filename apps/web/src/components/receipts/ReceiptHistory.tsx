'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  FileImage, 
  Eye, 
  Download, 
  Trash2, 
  Calendar,
  Filter,
  Grid,
  List,
  SortAsc,
  SortDesc
} from 'lucide-react'

// Mock data for receipt history
const mockReceipts = [
  {
    id: '1',
    filename: 'draftkings_receipt_001.jpg',
    uploadDate: '2024-01-15T10:30:00Z',
    sportsbook: 'DraftKings',
    sport: 'NFL',
    betType: 'STRAIGHT',
    amount: 50.00,
    odds: '+150',
    selection: 'Kansas City Chiefs ML',
    status: 'processed',
    confidence: 0.95,
    preview: '/api/receipts/1/preview'
  },
  {
    id: '2',
    filename: 'fanduel_parlay_002.png',
    uploadDate: '2024-01-14T15:45:00Z',
    sportsbook: 'FanDuel',
    sport: 'NBA',
    betType: 'PARLAY',
    amount: 25.00,
    odds: '+650',
    selection: '3-leg parlay',
    status: 'processed',
    confidence: 0.87,
    preview: '/api/receipts/2/preview'
  },
  {
    id: '3',
    filename: 'betmgm_receipt_003.jpg',
    uploadDate: '2024-01-13T09:15:00Z',
    sportsbook: 'BetMGM',
    sport: 'NHL',
    betType: 'PROP',
    amount: 75.00,
    odds: '-110',
    selection: 'Connor McDavid Over 1.5 Points',
    status: 'processing',
    confidence: 0.92,
    preview: '/api/receipts/3/preview'
  },
  {
    id: '4',
    filename: 'caesars_receipt_004.pdf',
    uploadDate: '2024-01-12T20:20:00Z',
    sportsbook: 'Caesars',
    sport: 'NBA',
    betType: 'STRAIGHT',
    amount: 100.00,
    odds: '+120',
    selection: 'Lakers vs Warriors O 235.5',
    status: 'error',
    confidence: 0.45,
    preview: null,
    error: 'Low confidence extraction - manual review required'
  }
]

type ViewMode = 'grid' | 'list'
type SortField = 'date' | 'amount' | 'confidence'
type SortOrder = 'asc' | 'desc'

export function ReceiptHistory() {
  const [receipts] = useState(mockReceipts)
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [sortField, setSortField] = useState<SortField>('date')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processed':
        return 'default'
      case 'processing':
        return 'secondary'
      case 'error':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const filteredReceipts = receipts
    .filter(receipt => {
      const matchesSearch = receipt.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           receipt.sportsbook.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           receipt.selection.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === 'all' || receipt.status === statusFilter
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      let aValue, bValue
      
      switch (sortField) {
        case 'date':
          aValue = new Date(a.uploadDate).getTime()
          bValue = new Date(b.uploadDate).getTime()
          break
        case 'amount':
          aValue = a.amount
          bValue = b.amount
          break
        case 'confidence':
          aValue = a.confidence
          bValue = b.confidence
          break
        default:
          return 0
      }
      
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue
    })

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('desc')
    }
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Receipt History</CardTitle>
          <CardDescription>
            View and manage your uploaded betting receipts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search receipts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-md border border-gray-300 px-3 py-2"
            >
              <option value="all">All Status</option>
              <option value="processed">Processed</option>
              <option value="processing">Processing</option>
              <option value="error">Error</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex rounded-lg border border-gray-200 p-1">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Sort Controls */}
          <div className="flex items-center space-x-4 mt-4 pt-4 border-t">
            <span className="text-sm text-gray-600">Sort by:</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleSort('date')}
              className="text-xs"
            >
              Date
              {sortField === 'date' && (
                sortOrder === 'asc' ? <SortAsc className="ml-1 h-3 w-3" /> : <SortDesc className="ml-1 h-3 w-3" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleSort('amount')}
              className="text-xs"
            >
              Amount
              {sortField === 'amount' && (
                sortOrder === 'asc' ? <SortAsc className="ml-1 h-3 w-3" /> : <SortDesc className="ml-1 h-3 w-3" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleSort('confidence')}
              className="text-xs"
            >
              Confidence
              {sortField === 'confidence' && (
                sortOrder === 'asc' ? <SortAsc className="ml-1 h-3 w-3" /> : <SortDesc className="ml-1 h-3 w-3" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {filteredReceipts.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileImage className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No receipts found</h3>
            <p className="text-gray-600">
              {searchTerm || statusFilter !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'Upload your first betting receipt to get started'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className={viewMode === 'grid' ? 'grid gap-6 md:grid-cols-2 lg:grid-cols-3' : 'space-y-4'}>
          {filteredReceipts.map((receipt) => (
            <Card key={receipt.id} className={viewMode === 'list' ? 'p-0' : ''}>
              {viewMode === 'grid' ? (
                <>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <Badge variant={getStatusColor(receipt.status)}>
                        {receipt.status}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {Math.round(receipt.confidence * 100)}%
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Preview */}
                    <div className="aspect-[4/3] bg-gray-100 rounded border flex items-center justify-center">
                      {receipt.preview ? (
                        <img
                          src={receipt.preview}
                          alt={receipt.filename}
                          className="w-full h-full object-cover rounded"
                        />
                      ) : (
                        <FileImage className="h-12 w-12 text-gray-400" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm truncate">{receipt.filename}</h4>
                      <div className="text-xs space-y-1">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Sportsbook:</span>
                          <span>{receipt.sportsbook}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Amount:</span>
                          <span>${receipt.amount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Date:</span>
                          <span>{formatDate(receipt.uploadDate)}</span>
                        </div>
                      </div>
                      
                      {receipt.error && (
                        <p className="text-xs text-red-600 bg-red-50 p-2 rounded">
                          {receipt.error}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-1">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-3 w-3" />
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </>
              ) : (
                <div className="flex items-center space-x-4 p-4">
                  {/* Preview Thumbnail */}
                  <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded border flex items-center justify-center">
                    {receipt.preview ? (
                      <img
                        src={receipt.preview}
                        alt={receipt.filename}
                        className="w-full h-full object-cover rounded"
                      />
                    ) : (
                      <FileImage className="h-8 w-8 text-gray-400" />
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm truncate">{receipt.filename}</h4>
                      <Badge variant={getStatusColor(receipt.status)} className="ml-2">
                        {receipt.status}
                      </Badge>
                    </div>
                    <div className="mt-1 grid grid-cols-2 gap-4 text-xs text-gray-600">
                      <div>
                        <span className="font-medium">{receipt.sportsbook}</span> • {receipt.sport}
                      </div>
                      <div>
                        ${receipt.amount} • {receipt.odds}
                      </div>
                      <div>
                        {formatDate(receipt.uploadDate)}
                      </div>
                      <div>
                        {Math.round(receipt.confidence * 100)}% confidence
                      </div>
                    </div>
                    <div className="mt-1 text-xs text-gray-900 truncate">
                      {receipt.selection}
                    </div>
                    {receipt.error && (
                      <p className="mt-1 text-xs text-red-600">
                        {receipt.error}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex-shrink-0 flex space-x-1">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}