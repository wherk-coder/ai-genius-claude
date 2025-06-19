'use client'

import { useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useCreateBet } from '@/hooks/queries/useBets'
import { AlertCircle, Plus, Trash2, ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
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

const BET_TYPES = [
  { value: 'STRAIGHT', label: 'Straight Bet', description: 'Single bet on one outcome' },
  { value: 'PARLAY', label: 'Parlay', description: 'Multiple bets combined (all must win)' },
  { value: 'PROP', label: 'Prop Bet', description: 'Proposition or player-specific bet' },
]

const LEG_TYPES = [
  { value: 'MONEYLINE', label: 'Moneyline', description: 'Win/loss bet' },
  { value: 'SPREAD', label: 'Point Spread', description: 'Win by X points' },
  { value: 'TOTAL', label: 'Over/Under', description: 'Total points scored' },
  { value: 'PROP', label: 'Player Prop', description: 'Player-specific bet' },
]

export default function NewBetPage() {
  const [step, setStep] = useState(1)
  const router = useRouter()
  const createBetMutation = useCreateBet()

  const form = useForm<BetForm>({
    resolver: zodResolver(betSchema),
    defaultValues: {
      type: 'STRAIGHT',
      sport: '',
      amount: 0,
      odds: '',
      description: '',
      legs: [],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'legs',
  })

  const watchedType = form.watch('type')

  const onSubmit = async (data: BetForm) => {
    try {
      await createBetMutation.mutateAsync(data)
      router.push('/bets')
    } catch (error) {
      console.error('Error creating bet:', error)
    }
  }

  const nextStep = () => {
    if (step < 3) setStep(step + 1)
  }

  const prevStep = () => {
    if (step > 1) setStep(step - 1)
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
      <div className="flex items-center space-x-4">
        <Link href="/bets">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Bets
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add New Bet</h1>
          <p className="text-gray-600">Track your betting activity</p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center space-x-4 mb-8">
        {[1, 2, 3].map((stepNumber) => (
          <div key={stepNumber} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step >= stepNumber 
                ? 'bg-primary-600 text-white' 
                : 'bg-gray-200 text-gray-600'
            }`}>
              {step > stepNumber ? <CheckCircle className="h-4 w-4" /> : stepNumber}
            </div>
            {stepNumber < 3 && (
              <div className={`w-12 h-1 ${
                step > stepNumber ? 'bg-primary-600' : 'bg-gray-200'
              }`} />
            )}
          </div>
        ))}
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Step 1: Bet Type & Sport */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Step 1: Bet Type & Sport</CardTitle>
              <CardDescription>Choose your bet type and sport</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Bet Type Selection */}
              <div className="space-y-3">
                <Label>Bet Type</Label>
                <div className="grid gap-3 md:grid-cols-3">
                  {BET_TYPES.map((type) => (
                    <div
                      key={type.value}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        form.watch('type') === type.value
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => form.setValue('type', type.value as any)}
                    >
                      <div className="font-medium">{type.label}</div>
                      <div className="text-sm text-gray-600">{type.description}</div>
                    </div>
                  ))}
                </div>
                {form.formState.errors.type && (
                  <p className="text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {form.formState.errors.type.message}
                  </p>
                )}
              </div>

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

              <div className="flex justify-end">
                <Button type="button" onClick={nextStep}>
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Bet Details */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Step 2: Bet Details</CardTitle>
              <CardDescription>
                {watchedType === 'PARLAY' 
                  ? 'Add multiple legs to your parlay' 
                  : 'Enter your bet information'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Single Bet Details */}
              {watchedType !== 'PARLAY' && (
                <div className="grid gap-4 md:grid-cols-2">
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

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      placeholder="Team vs Team, Over 47.5, etc."
                      {...form.register('description')}
                    />
                  </div>
                </div>
              )}

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

              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={prevStep}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Previous
                </Button>
                <Button type="button" onClick={nextStep}>
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Amount & Review */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Step 3: Amount & Review</CardTitle>
              <CardDescription>Set your bet amount and review details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Bet Amount */}
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

              {/* Review */}
              <div className="border rounded-lg p-4 bg-gray-50">
                <h4 className="font-medium mb-3">Bet Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Type:</span>
                    <span className="font-medium">{form.watch('type')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sport:</span>
                    <span className="font-medium">{form.watch('sport')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Amount:</span>
                    <span className="font-medium">${form.watch('amount')?.toFixed(2) || '0.00'}</span>
                  </div>
                  {watchedType !== 'PARLAY' && (
                    <>
                      <div className="flex justify-between">
                        <span>Odds:</span>
                        <span className="font-medium">{form.watch('odds')}</span>
                      </div>
                      {form.watch('description') && (
                        <div className="flex justify-between">
                          <span>Description:</span>
                          <span className="font-medium">{form.watch('description')}</span>
                        </div>
                      )}
                    </>
                  )}
                  {watchedType === 'PARLAY' && (
                    <div>
                      <span>Legs: {fields.length}</span>
                    </div>
                  )}
                </div>
              </div>

              {createBetMutation.error && (
                <div className="rounded-md bg-red-50 p-4">
                  <div className="flex">
                    <AlertCircle className="h-5 w-5 text-red-400" />
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">
                        Error creating bet
                      </h3>
                      <div className="mt-2 text-sm text-red-700">
                        {createBetMutation.error.message || 'Please try again'}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={prevStep}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Previous
                </Button>
                <Button type="submit" disabled={createBetMutation.isPending}>
                  {createBetMutation.isPending ? 'Creating...' : 'Create Bet'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </form>
    </div>
  )
}