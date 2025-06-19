'use client'

import { useState, useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useBet, useUpdateBet } from '@/hooks/queries/useBets'
import { AlertCircle, Plus, Trash2, ArrowLeft, Save } from 'lucide-react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

const betLegSchema = z.object({
  gameId: z.string().optional(),
  type: z.enum(['MONEYLINE', 'SPREAD', 'TOTAL', 'PROP']),
  selection: z.string().min(1, 'Selection is required'),
  odds: z.string().min(1, 'Odds are required'),
  handicap: z.number().optional(),
  total: z.number().optional(),
  propDescription: z.string().optional(),
})

const betSchema = z.object({
  type: z.enum(['STRAIGHT', 'PARLAY', 'PROP']),
  sport: z.string().min(1, 'Sport is required'),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  odds: z.string().min(1, 'Odds are required'),
  status: z.enum(['PENDING', 'WON', 'LOST', 'PUSHED', 'CANCELLED']).optional(),
  description: z.string().optional(),
  gameId: z.string().optional(),
  legs: z.array(betLegSchema).optional(),
}).refine((data) => {
  if (data.type === 'PARLAY') {
    return data.legs && data.legs.length >= 2
  }
  return true
}, {
  message: "Parlay bets must have at least 2 legs",
  path: ["legs"],
})

type BetForm = z.infer<typeof betSchema>

const SPORTS = [
  'NFL', 'NBA', 'MLB', 'NHL', 'NCAAF', 'NCAAB', 'Soccer', 'Tennis', 'Golf', 'MMA', 'Boxing', 'Other'
]

const STATUSES = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'WON', label: 'Won' },
  { value: 'LOST', label: 'Lost' },
  { value: 'PUSHED', label: 'Pushed' },
  { value: 'CANCELLED', label: 'Cancelled' },
]

const LEG_TYPES = [
  { value: 'MONEYLINE', label: 'Moneyline', description: 'Win/loss bet' },
  { value: 'SPREAD', label: 'Point Spread', description: 'Win by X points' },
  { value: 'TOTAL', label: 'Over/Under', description: 'Total points scored' },
  { value: 'PROP', label: 'Player Prop', description: 'Player-specific bet' },
]

export default function EditBetPage() {
  const params = useParams()
  const betId = params.id as string
  const router = useRouter()
  
  const { data: bet, isLoading: betLoading } = useBet(betId)
  const updateBetMutation = useUpdateBet(betId)

  const form = useForm<BetForm>({
    resolver: zodResolver(betSchema),
    defaultValues: {
      type: 'STRAIGHT',
      sport: '',
      amount: 0,
      odds: '',
      status: 'PENDING',
      description: '',
      legs: [],
    },
  })

  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: 'legs',
  })

  const watchedType = form.watch('type')

  // Populate form when bet data loads
  useEffect(() => {
    if (bet) {
      form.reset({
        type: bet.type,
        sport: bet.sport,
        amount: bet.amount,
        odds: bet.odds,
        status: bet.status,
        description: bet.description || '',
        legs: bet.legs || [],
      })
      
      if (bet.legs) {
        replace(bet.legs)
      }
    }
  }, [bet, form, replace])

  if (betLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center space-x-4">
          <div className="h-8 bg-gray-200 rounded animate-pulse w-24"></div>
          <div className="h-8 bg-gray-200 rounded animate-pulse w-48"></div>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!bet) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900">Bet not found</h2>
          <p className="text-gray-600 mt-2">The bet you're trying to edit doesn't exist.</p>
          <Link href="/bets" className="mt-4 inline-block">
            <Button>Back to Bets</Button>
          </Link>
        </div>
      </div>
    )
  }

  const onSubmit = async (data: BetForm) => {
    try {
      await updateBetMutation.mutateAsync(data)
      router.push(`/bets/${betId}`)
    } catch (error) {
      console.error('Error updating bet:', error)
    }
  }

  const addLeg = () => {
    append({
      type: 'MONEYLINE',
      selection: '',
      odds: '',
    })
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href={`/bets/${betId}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Bet
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Bet</h1>
            <p className="text-gray-600">{bet.description || `${bet.sport} ${bet.type}`}</p>
          </div>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Update bet type, sport, and status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              {/* Sport Selection */}
              <div className="space-y-2">
                <Label htmlFor="sport">Sport</Label>
                <select
                  {...form.register('sport')}
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                >
                  <option value="">Select a sport</option>
                  {SPORTS.map((sport) => (
                    <option key={sport} value={sport}>
                      {sport}
                    </option>
                  ))}
                </select>
                {form.formState.errors.sport && (
                  <p className="text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {form.formState.errors.sport.message}
                  </p>
                )}
              </div>

              {/* Bet Type - Read Only */}
              <div className="space-y-2">
                <Label>Bet Type</Label>
                <div className="w-full rounded-md border border-gray-300 px-3 py-2 bg-gray-50 text-gray-600">
                  {bet.type}
                </div>
                <p className="text-xs text-gray-500">Bet type cannot be changed</p>
              </div>

              {/* Status Selection */}
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select
                  {...form.register('status')}
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                >
                  {STATUSES.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
                {form.formState.errors.status && (
                  <p className="text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {form.formState.errors.status.message}
                  </p>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="Team vs Team, Over 47.5, etc."
                {...form.register('description')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Bet Details */}
        <Card>
          <CardHeader>
            <CardTitle>Bet Details</CardTitle>
            <CardDescription>
              {watchedType === 'PARLAY' 
                ? 'Update parlay legs and amount' 
                : 'Update bet odds and amount'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Amount */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="amount">Bet Amount ($)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  {...form.register('amount', { valueAsNumber: true })}
                />
                {form.formState.errors.amount && (
                  <p className="text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {form.formState.errors.amount.message}
                  </p>
                )}
              </div>

              {/* Single Bet Odds */}
              {watchedType !== 'PARLAY' && (
                <div className="space-y-2">
                  <Label htmlFor="odds">Odds</Label>
                  <Input
                    id="odds"
                    placeholder="+150, -110, 2.5, etc."
                    {...form.register('odds')}
                  />
                  {form.formState.errors.odds && (
                    <p className="text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {form.formState.errors.odds.message}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Parlay Legs */}
            {watchedType === 'PARLAY' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Parlay Legs</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addLeg}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Leg
                  </Button>
                </div>

                {fields.map((field, index) => (
                  <div key={field.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Leg {index + 1}</h4>
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => remove(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Bet Type</Label>
                        <select
                          {...form.register(`legs.${index}.type` as const)}
                          className="w-full rounded-md border border-gray-300 px-3 py-2"
                        >
                          {LEG_TYPES.map((type) => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <Label>Selection</Label>
                        <Input
                          placeholder="Team, Player, etc."
                          {...form.register(`legs.${index}.selection` as const)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Odds</Label>
                        <Input
                          placeholder="+150, -110, etc."
                          {...form.register(`legs.${index}.odds` as const)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Description (Optional)</Label>
                        <Input
                          placeholder="Additional details"
                          {...form.register(`legs.${index}.propDescription` as const)}
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {form.formState.errors.legs && (
                  <p className="text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {form.formState.errors.legs.message}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Error Display */}
        {updateBetMutation.error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Error updating bet
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  {updateBetMutation.error.message || 'Please try again'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-between">
          <Link href={`/bets/${betId}`}>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={updateBetMutation.isPending}>
            <Save className="mr-2 h-4 w-4" />
            {updateBetMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  )
}