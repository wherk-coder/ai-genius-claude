'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PaymentModal } from '@/components/payments/PaymentModal'
import { 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Crown, 
  Star, 
  Shield,
  Calendar,
  DollarSign,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'

interface SubscriptionManagerProps {
  currentPlan: {
    id: string
    name: string
    price: number
    billingPeriod: 'monthly' | 'yearly'
    status: 'active' | 'cancelled' | 'past_due'
    nextBillingDate: string
    cancelAtPeriodEnd: boolean
  }
  availablePlans: Array<{
    id: string
    name: string
    price: number
    description: string
    features: string[]
    icon: any
  }>
  onPlanChange: (planId: string) => void
}

export function SubscriptionManager({ 
  currentPlan, 
  availablePlans, 
  onPlanChange 
}: SubscriptionManagerProps) {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [showDowngradeConfirm, setShowDowngradeConfirm] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<any>(null)
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly')

  const handleUpgrade = (planId: string) => {
    const plan = availablePlans.find(p => p.id === planId)
    if (plan) {
      setSelectedPlan(plan)
      setShowUpgradeModal(true)
    }
  }

  const handleDowngrade = (planId: string) => {
    const plan = availablePlans.find(p => p.id === planId)
    if (plan) {
      setSelectedPlan(plan)
      setShowDowngradeConfirm(true)
    }
  }

  const confirmDowngrade = () => {
    if (selectedPlan) {
      onPlanChange(selectedPlan.id)
      setShowDowngradeConfirm(false)
      setSelectedPlan(null)
    }
  }

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'premium':
        return Crown
      case 'plus':
        return Star
      default:
        return Shield
    }
  }

  const getPlanComparison = (targetPlanId: string) => {
    const currentPlanIndex = availablePlans.findIndex(p => p.id === currentPlan.id)
    const targetPlanIndex = availablePlans.findIndex(p => p.id === targetPlanId)
    
    if (targetPlanIndex > currentPlanIndex) return 'upgrade'
    if (targetPlanIndex < currentPlanIndex) return 'downgrade'
    return 'same'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getYearlyPrice = (monthlyPrice: number) => {
    return monthlyPrice * 12 * 0.8 // 20% off yearly
  }

  return (
    <div className="space-y-6">
      {/* Current Plan Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Current Subscription</span>
            <Badge variant={currentPlan.status === 'active' ? 'default' : 'destructive'}>
              {currentPlan.status}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center space-x-3">
              {(() => {
                const Icon = getPlanIcon(currentPlan.id)
                return <Icon className="h-8 w-8 text-blue-600" />
              })()}
              <div>
                <div className="font-semibold text-lg">{currentPlan.name}</div>
                <div className="text-sm text-gray-600">
                  ${currentPlan.price}/{currentPlan.billingPeriod}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-gray-400" />
              <div>
                <div className="text-sm text-gray-600">Next billing</div>
                <div className="font-medium">{formatDate(currentPlan.nextBillingDate)}</div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-gray-400" />
              <div>
                <div className="text-sm text-gray-600">Annual savings</div>
                <div className="font-medium text-green-600">
                  ${((currentPlan.price * 12) - getYearlyPrice(currentPlan.price)).toFixed(0)} with yearly
                </div>
              </div>
            </div>
          </div>

          {currentPlan.cancelAtPeriodEnd && (
            <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium">Subscription will be cancelled</p>
                  <p>Your access to premium features will end on {formatDate(currentPlan.nextBillingDate)}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Plan Options */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Change Your Plan</h3>
        
        {/* Billing Period Toggle */}
        <div className="flex justify-center mb-6">
          <div className="flex items-center space-x-4 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                billingPeriod === 'monthly'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod('yearly')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                billingPeriod === 'yearly'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Yearly
              <Badge variant="secondary" className="ml-2 text-xs">
                Save 20%
              </Badge>
            </button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {availablePlans.map((plan) => {
            const Icon = plan.icon
            const comparison = getPlanComparison(plan.id)
            const isCurrentPlan = plan.id === currentPlan.id
            const price = billingPeriod === 'yearly' ? getYearlyPrice(plan.price) / 12 : plan.price

            return (
              <Card key={plan.id} className={`relative ${isCurrentPlan ? 'ring-2 ring-blue-500' : ''}`}>
                <CardHeader className="text-center">
                  <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-2">
                    <Icon className="h-6 w-6 text-gray-600" />
                  </div>
                  <CardTitle className="text-xl">
                    {plan.name}
                    {isCurrentPlan && (
                      <Badge variant="outline" className="ml-2 text-xs">
                        Current
                      </Badge>
                    )}
                  </CardTitle>
                  <div className="text-2xl font-bold">
                    ${price.toFixed(2)}
                    <span className="text-sm font-normal text-gray-600">/month</span>
                  </div>
                  {billingPeriod === 'yearly' && (
                    <div className="text-xs text-green-600">
                      Save ${((plan.price * 12) - getYearlyPrice(plan.price)).toFixed(0)}/year
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 mb-6">
                    {plan.features.slice(0, 4).map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                    {plan.features.length > 4 && (
                      <div className="text-xs text-gray-500">
                        +{plan.features.length - 4} more features
                      </div>
                    )}
                  </div>

                  {!isCurrentPlan && (
                    <Button
                      className="w-full"
                      variant={comparison === 'upgrade' ? 'default' : 'outline'}
                      onClick={() => {
                        if (comparison === 'upgrade') {
                          handleUpgrade(plan.id)
                        } else {
                          handleDowngrade(plan.id)
                        }
                      }}
                    >
                      {comparison === 'upgrade' && (
                        <ArrowUpCircle className="mr-2 h-4 w-4" />
                      )}
                      {comparison === 'downgrade' && (
                        <ArrowDownCircle className="mr-2 h-4 w-4" />
                      )}
                      {comparison === 'upgrade' ? 'Upgrade' : 'Downgrade'}
                    </Button>
                  )}

                  {isCurrentPlan && (
                    <Button className="w-full" variant="outline" disabled>
                      Current Plan
                    </Button>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && selectedPlan && (
        <PaymentModal
          isOpen={showUpgradeModal}
          onClose={() => {
            setShowUpgradeModal(false)
            setSelectedPlan(null)
          }}
          planId={selectedPlan.id}
          planName={selectedPlan.name}
          amount={billingPeriod === 'yearly' ? getYearlyPrice(selectedPlan.price) : selectedPlan.price}
          billingPeriod={billingPeriod}
        />
      )}

      {/* Downgrade Confirmation */}
      {showDowngradeConfirm && selectedPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ArrowDownCircle className="h-5 w-5 text-orange-600" />
                <span>Confirm Downgrade</span>
              </CardTitle>
              <CardDescription>
                Are you sure you want to downgrade to {selectedPlan.name}?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-orange-50 p-3 rounded-lg">
                <h4 className="font-medium text-orange-800 mb-2">You will lose access to:</h4>
                <ul className="text-sm text-orange-700 space-y-1">
                  <li>• Advanced analytics features</li>
                  <li>• Premium AI insights</li>
                  <li>• Priority customer support</li>
                  <li>• Additional integrations</li>
                </ul>
              </div>
              
              <p className="text-sm text-gray-600">
                The downgrade will take effect at the end of your current billing period 
                ({formatDate(currentPlan.nextBillingDate)}).
              </p>

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDowngradeConfirm(false)
                    setSelectedPlan(null)
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={confirmDowngrade}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  Confirm Downgrade
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}