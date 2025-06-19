'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useDeleteBet } from '@/hooks/queries/useBets'
import { Trash2, Download, CheckSquare, Square } from 'lucide-react'

interface BulkActionsProps {
  bets: any[]
  selectedBets: string[]
  onSelectionChange: (selectedBets: string[]) => void
  onExport?: () => void
}

export function BulkActions({ bets, selectedBets, onSelectionChange, onExport }: BulkActionsProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const deleteBetMutation = useDeleteBet()

  const handleSelectAll = () => {
    if (selectedBets.length === bets.length) {
      onSelectionChange([])
    } else {
      onSelectionChange(bets.map(bet => bet.id))
    }
  }

  const handleSelectBet = (betId: string) => {
    if (selectedBets.includes(betId)) {
      onSelectionChange(selectedBets.filter(id => id !== betId))
    } else {
      onSelectionChange([...selectedBets, betId])
    }
  }

  const handleBulkDelete = async () => {
    if (selectedBets.length === 0) return
    
    const confirmMessage = `Are you sure you want to delete ${selectedBets.length} bet${selectedBets.length > 1 ? 's' : ''}? This action cannot be undone.`
    
    if (!confirm(confirmMessage)) return

    setIsDeleting(true)
    try {
      for (const betId of selectedBets) {
        await deleteBetMutation.mutateAsync(betId)
      }
      onSelectionChange([])
    } catch (error) {
      console.error('Error deleting bets:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleExport = () => {
    if (selectedBets.length === 0) {
      // Export all bets
      if (onExport) {
        onExport()
      } else {
        // Default export logic
        const csvData = generateCSV(bets)
        downloadCSV(csvData, 'all-bets.csv')
      }
    } else {
      // Export selected bets
      const selectedBetsData = bets.filter(bet => selectedBets.includes(bet.id))
      const csvData = generateCSV(selectedBetsData)
      downloadCSV(csvData, 'selected-bets.csv')
    }
  }

  const generateCSV = (betsData: any[]) => {
    const headers = [
      'Date',
      'Sport',
      'Type',
      'Description',
      'Amount',
      'Odds',
      'Status',
      'Profit/Loss'
    ]

    const rows = betsData.map(bet => {
      const profitLoss = bet.status === 'WON' 
        ? bet.potentialPayout - bet.amount 
        : bet.status === 'LOST' 
        ? -bet.amount 
        : 0

      return [
        new Date(bet.createdAt).toLocaleDateString(),
        bet.sport,
        bet.type,
        bet.description || `${bet.sport} ${bet.type}`,
        bet.amount.toFixed(2),
        bet.odds,
        bet.status,
        profitLoss.toFixed(2)
      ]
    })

    return [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n')
  }

  const downloadCSV = (csvData: string, filename: string) => {
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', filename)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  if (bets.length === 0) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Bulk Actions</span>
          <div className="text-sm font-normal text-gray-600">
            {selectedBets.length} of {bets.length} selected
          </div>
        </CardTitle>
        <CardDescription>
          Select multiple bets to perform bulk operations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          {/* Selection Controls */}
          <div className="flex items-center space-x-4">
            <button
              onClick={handleSelectAll}
              className="flex items-center space-x-2 text-sm text-gray-700 hover:text-gray-900"
            >
              {selectedBets.length === bets.length ? (
                <CheckSquare className="h-4 w-4" />
              ) : (
                <Square className="h-4 w-4" />
              )}
              <span>
                {selectedBets.length === bets.length ? 'Deselect All' : 'Select All'}
              </span>
            </button>
            
            {selectedBets.length > 0 && (
              <span className="text-sm text-gray-600">
                {selectedBets.length} bet{selectedBets.length > 1 ? 's' : ''} selected
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
            >
              <Download className="mr-2 h-4 w-4" />
              Export {selectedBets.length > 0 ? 'Selected' : 'All'}
            </Button>
            
            {selectedBets.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkDelete}
                disabled={isDeleting}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {isDeleting ? 'Deleting...' : `Delete ${selectedBets.length}`}
              </Button>
            )}
          </div>
        </div>

        {/* Selection Helper */}
        {selectedBets.length === 0 && (
          <div className="mt-4 p-3 bg-blue-50 rounded-md">
            <p className="text-sm text-blue-700">
              💡 Tip: Click the checkboxes in the table below to select bets for bulk operations
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Enhanced table row component with selection
export function SelectableBetRow({ 
  bet, 
  isSelected, 
  onSelectionChange, 
  children 
}: { 
  bet: any
  isSelected: boolean
  onSelectionChange: (betId: string) => void
  children: React.ReactNode 
}) {
  return (
    <tr className={`border-b hover:bg-gray-50 ${isSelected ? 'bg-blue-50' : ''}`}>
      <td className="py-3 px-4">
        <button
          onClick={() => onSelectionChange(bet.id)}
          className="flex items-center justify-center"
        >
          {isSelected ? (
            <CheckSquare className="h-4 w-4 text-blue-600" />
          ) : (
            <Square className="h-4 w-4 text-gray-400 hover:text-gray-600" />
          )}
        </button>
      </td>
      {children}
    </tr>
  )
}