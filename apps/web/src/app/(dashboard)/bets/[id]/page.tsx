'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useBet } from '@/hooks/queries/useBets'
import { ArrowLeft, Edit, Trash2, Trophy, Target, Calendar, DollarSign } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

export default function BetDetailPage() {
  const params = useParams()
  const betId = params.id as string
  
  const { data: bet, isLoading } = useBet(betId)

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center space-x-4">
          <div className="h-8 bg-gray-200 rounded animate-pulse w-24"></div>
          <div className="h-8 bg-gray-200 rounded animate-pulse w-48"></div>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!bet) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900">Bet not found</h2>
          <p className="text-gray-600 mt-2">The bet you're looking for doesn't exist.</p>
          <Link href="/bets" className="mt-4 inline-block">
            <Button>Back to Bets</Button>
          </Link>
        </div>
      </div>
    )
  }

  const profitLoss = bet.status === 'WON' 
    ? bet.potentialPayout - bet.amount 
    : bet.status === 'LOST' 
    ? -bet.amount 
    : 0

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'WON': return 'bg-green-100 text-green-700 border-green-200'
      case 'LOST': return 'bg-red-100 text-red-700 border-red-200'
      case 'PENDING': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'PUSHED': return 'bg-gray-100 text-gray-700 border-gray-200'
      case 'CANCELLED': return 'bg-gray-100 text-gray-700 border-gray-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const calculatePotentialPayout = () => {
    if (bet.type === 'PARLAY' && bet.legs && bet.legs.length > 0) {
      // For parlays, calculate combined odds
      return bet.potentialPayout || bet.amount * 2 // Fallback calculation
    } else {
      // For straight bets, parse odds
      const odds = bet.odds
      if (odds.startsWith('+')) {
        const oddsValue = parseInt(odds.substring(1))
        return bet.amount + (bet.amount * (oddsValue / 100))
      } else if (odds.startsWith('-')) {
        const oddsValue = parseInt(odds.substring(1))
        return bet.amount + (bet.amount * (100 / oddsValue))
      } else {
        // Decimal odds
        const oddsValue = parseFloat(odds)
        return bet.amount * oddsValue
      }
    }
  }

  const potentialPayout = calculatePotentialPayout()

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/bets">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Bets
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Bet Details</h1>
            <p className="text-gray-600">{bet.description || `${bet.sport} ${bet.type}`}</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Link href={`/bets/${bet.id}/edit`}>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </Link>
          <Button variant="outline" className="text-red-600 hover:text-red-700">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Status Banner */}
      <div className={`border rounded-lg p-4 ${getStatusColor(bet.status)}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-full bg-white/50">
              {bet.status === 'WON' ? (
                <Trophy className="h-5 w-5" />
              ) : bet.status === 'PENDING' ? (
                <Target className="h-5 w-5" />
              ) : (
                <DollarSign className="h-5 w-5" />
              )}
            </div>
            <div>
              <div className="font-medium text-lg">{bet.status}</div>
              <div className="text-sm opacity-80">
                {bet.status === 'PENDING' ? 'Bet is still active' : 
                 bet.status === 'WON' ? 'Congratulations! You won this bet' :
                 bet.status === 'LOST' ? 'Better luck next time' :
                 'Bet was pushed/cancelled'}
              </div>
            </div>
          </div>
          {profitLoss !== 0 && (
            <div className="text-right">
              <div className="text-2xl font-bold">
                {profitLoss > 0 ? '+' : ''}${profitLoss.toFixed(2)}
              </div>
              <div className="text-sm opacity-80">Profit/Loss</div>
            </div>
          )}
        </div>
      </div>

      {/* Main Info Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Bet Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${bet.amount.toFixed(2)}</div>
            <p className="text-xs text-gray-500">Wagered</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Odds</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bet.odds}</div>
            <p className="text-xs text-gray-500">Original odds</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Potential Payout</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${potentialPayout.toFixed(2)}</div>
            <p className="text-xs text-gray-500">If win</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Bet Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bet.type}</div>
            <p className="text-xs text-gray-500">{bet.sport}</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Information */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Bet Information */}
        <Card>
          <CardHeader>
            <CardTitle>Bet Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Sport:</span>
              <span className="font-medium">{bet.sport}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Type:</span>
              <span className="font-medium">{bet.type}</span>
            </div>
            {bet.description && (
              <div className="flex justify-between">
                <span className="text-gray-600">Description:</span>
                <span className="font-medium">{bet.description}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(bet.status).replace('border-', '').replace('bg-', 'bg-').replace('text-', 'text-')}`}>
                {bet.status}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Placed:</span>
              <span className="font-medium">{formatDate(bet.createdAt)}</span>
            </div>
            {bet.settledAt && (
              <div className="flex justify-between">
                <span className="text-gray-600">Settled:</span>
                <span className="font-medium">{formatDate(bet.settledAt)}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Financial Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Financial Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Bet Amount:</span>
              <span className="font-medium">${bet.amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Potential Payout:</span>
              <span className="font-medium">${potentialPayout.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Potential Profit:</span>
              <span className="font-medium text-green-600">
                +${(potentialPayout - bet.amount).toFixed(2)}
              </span>
            </div>
            <hr />
            <div className="flex justify-between text-lg">
              <span className="font-medium">Actual Result:</span>
              <span className={`font-bold ${profitLoss > 0 ? 'text-green-600' : profitLoss < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                {profitLoss > 0 ? '+' : ''}${profitLoss.toFixed(2)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Parlay Legs */}
      {bet.type === 'PARLAY' && bet.legs && bet.legs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Parlay Legs</CardTitle>
            <CardDescription>All legs must win for the parlay to be successful</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {bet.legs.map((leg: any, index: number) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Leg {index + 1}</h4>
                    <span className="text-sm text-gray-600">{leg.type}</span>
                  </div>
                  <div className="grid gap-2 md:grid-cols-2">
                    <div>
                      <span className="text-sm text-gray-600">Selection:</span>
                      <div className="font-medium">{leg.selection}</div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Odds:</span>
                      <div className="font-medium">{leg.odds}</div>
                    </div>
                    {leg.handicap && (
                      <div>
                        <span className="text-sm text-gray-600">Handicap:</span>
                        <div className="font-medium">{leg.handicap}</div>
                      </div>
                    )}
                    {leg.total && (
                      <div>
                        <span className="text-sm text-gray-600">Total:</span>
                        <div className="font-medium">{leg.total}</div>
                      </div>
                    )}
                    {leg.propDescription && (
                      <div className="md:col-span-2">
                        <span className="text-sm text-gray-600">Description:</span>
                        <div className="font-medium">{leg.propDescription}</div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}