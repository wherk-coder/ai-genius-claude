'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Sparkles, TrendingUp, AlertTriangle } from 'lucide-react'
import { apiClient } from '@/lib/api-client'

interface ParsedBet {
  description: string
  type: 'STRAIGHT' | 'PARLAY' | 'PROP'
  sport: string
  amount?: number
  odds?: string
  confidence: number
  extractedEntities: {
    teams?: string[]
    player?: string
    betType?: string
    handicap?: number
    total?: number
  }
}

export function NaturalLanguageBetEntry() {
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [parsedBet, setParsedBet] = useState<ParsedBet | null>(null)
  const [error, setError] = useState('')

  const handleParse = async () => {
    if (!input.trim()) return

    setIsLoading(true)
    setError('')
    setParsedBet(null)

    try {
      const result = await apiClient.parseNaturalLanguageBet(input)
      
      if (result) {
        setParsedBet(result)
      } else {
        setError('Could not parse your bet. Please try being more specific.')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to parse bet')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateBet = async () => {
    if (!parsedBet) return

    try {
      await apiClient.createBet({
        type: parsedBet.type,
        sport: parsedBet.sport,
        amount: parsedBet.amount || 0,
        odds: parsedBet.odds || '',
        description: parsedBet.description,
        status: 'PENDING',
      })

      // Reset form
      setInput('')
      setParsedBet(null)
      // Could show success toast here
    } catch (err: any) {
      setError(err.message || 'Failed to create bet')
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-green-100 text-green-800'
    if (confidence >= 0.6) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  const getConfidenceText = (confidence: number) => {
    if (confidence >= 0.8) return 'High Confidence'
    if (confidence >= 0.6) return 'Medium Confidence'
    return 'Low Confidence'
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-blue-600" />
          AI Bet Entry
        </CardTitle>
        <CardDescription>
          Describe your bet in natural language and let AI parse it for you
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Input */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              placeholder="e.g., Put $50 on the Lakers to beat the Warriors by more than 5 points"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleParse()}
              className="flex-1"
            />
            <Button 
              onClick={handleParse} 
              disabled={!input.trim() || isLoading}
              className="px-6"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Parse'
              )}
            </Button>
          </div>
          
          {/* Example inputs */}
          <div className="text-xs text-gray-500">
            <span className="font-medium">Examples:</span>
            <div className="mt-1 space-y-1">
              <div>"$100 on Chiefs moneyline vs Bills"</div>
              <div>"Bet $25 on Lakers +5.5 against Warriors"</div>
              <div>"Put $50 on over 47.5 points in Cowboys game"</div>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Parsed Result */}
        {parsedBet && (
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Parsed Bet</CardTitle>
                <Badge className={getConfidenceColor(parsedBet.confidence)}>
                  {getConfidenceText(parsedBet.confidence)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Main Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Sport</label>
                  <div className="text-sm text-gray-900">{parsedBet.sport}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Type</label>
                  <div className="text-sm text-gray-900">{parsedBet.type}</div>
                </div>
                {parsedBet.amount && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Amount</label>
                    <div className="text-sm text-gray-900">${parsedBet.amount}</div>
                  </div>
                )}
                {parsedBet.odds && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Odds</label>
                    <div className="text-sm text-gray-900">{parsedBet.odds}</div>
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="text-sm font-medium text-gray-700">Description</label>
                <div className="text-sm text-gray-900 mt-1">{parsedBet.description}</div>
              </div>

              {/* Extracted Entities */}
              {Object.keys(parsedBet.extractedEntities).length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Extracted Information</label>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {parsedBet.extractedEntities.teams?.map((team, index) => (
                      <Badge key={index} variant="outline">
                        Team: {team}
                      </Badge>
                    ))}
                    {parsedBet.extractedEntities.player && (
                      <Badge variant="outline">
                        Player: {parsedBet.extractedEntities.player}
                      </Badge>
                    )}
                    {parsedBet.extractedEntities.betType && (
                      <Badge variant="outline">
                        Bet: {parsedBet.extractedEntities.betType}
                      </Badge>
                    )}
                    {parsedBet.extractedEntities.handicap && (
                      <Badge variant="outline">
                        Spread: {parsedBet.extractedEntities.handicap}
                      </Badge>
                    )}
                    {parsedBet.extractedEntities.total && (
                      <Badge variant="outline">
                        Total: {parsedBet.extractedEntities.total}
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button onClick={handleCreateBet} className="flex-1">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Create Bet
                </Button>
                <Button variant="outline" onClick={() => setParsedBet(null)}>
                  Edit
                </Button>
              </div>

              {/* Confidence Warning */}
              {parsedBet.confidence < 0.7 && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Low confidence parsing. Please review the extracted information carefully 
                    before creating the bet.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  )
}