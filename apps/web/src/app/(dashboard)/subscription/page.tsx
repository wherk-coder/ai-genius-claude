'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PaymentModal } from '@/components/payments/PaymentModal'
import { 
  Check, 
  X, 
  Crown, 
  Star, 
  Zap, 
  TrendingUp,
  Shield,
  Smartphone,
  BarChart3,
  Receipt,
  CreditCard,
  Calendar
} from 'lucide-react'

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    period: 'forever',
    description: 'Perfect for casual bettors getting started',
    features: [
      { name: 'Track up to 25 bets per month', included: true },
      { name: 'Basic analytics dashboard', included: true },
      { name: 'Manual bet entry', included: true },
      { name: 'Export data (CSV)', included: true },
      { name: 'Community support', included: true },
      { name: 'Receipt scanning', included: false },
      { name: 'Advanced analytics', included: false },
      { name: 'AI insights', included: false },
      { name: 'Priority support', included: false },
      { name: 'Mobile app access', included: false },
    ],
    popular: false,
    icon: Shield,
    color: 'gray'
  },
  {
    id: 'plus',
    name: 'Plus',
    price: 9.99,
    period: 'month',
    description: 'For serious bettors who want more insights',
    features: [
      { name: 'Unlimited bet tracking', included: true },
      { name: 'Advanced analytics & trends', included: true },
      { name: 'Receipt scanning (50/month)', included: true },
      { name: 'Basic AI insights', included: true },
      { name: 'Export data (CSV, Excel)', included: true },
      { name: 'Email support', included: true },
      { name: 'Mobile app access', included: true },
      { name: 'Custom bet categories', included: true },
      { name: 'Premium AI insights', included: false },
      { name: 'Priority support', included: false },
    ],
    popular: true,
    icon: Star,
    color: 'blue'
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 19.99,
    period: 'month',
    description: 'Everything you need to maximize your betting ROI',
    features: [
      { name: 'Everything in Plus', included: true },
      { name: 'Unlimited receipt scanning', included: true },
      { name: 'Premium AI insights & predictions', included: true },
      { name: 'Advanced bankroll management', included: true },
      { name: 'Live odds comparison', included: true },
      { name: 'Priority customer support', included: true },
      { name: 'API access for integrations', included: true },
      { name: 'White-label reporting', included: true },
      { name: 'Early access to new features', included: true },
      { name: 'Personal betting coach', included: true },
    ],
    popular: false,
    icon: Crown,
    color: 'gold'
  }
]

const currentPlan = 'free' // This would come from user context

export default function SubscriptionPage() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly')
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentPlan, setPaymentPlan] = useState<{
    id: string
    name: string
    amount: number
  } | null>(null)

  const getDiscountedPrice = (price: number) => {
    return billingPeriod === 'yearly' ? price * 12 * 0.8 : price // 20% off yearly
  }

  const handleUpgrade = (planId: string) => {
    setSelectedPlan(planId)
    
    if (planId === 'free') {
      // Handle downgrade to free - would need confirmation
      console.log('Downgrading to free plan')
      return
    }

    const plan = plans.find(p => p.id === planId)
    if (plan && plan.price > 0) {
      const amount = billingPeriod === 'yearly' 
        ? getDiscountedPrice(plan.price) 
        : plan.price

      setPaymentPlan({
        id: planId,
        name: plan.name,
        amount
      })
      setShowPaymentModal(true)
    }
  }

  const getButtonText = (planId: string) => {
    if (planId === currentPlan) return 'Current Plan'
    if (planId === 'free' && currentPlan !== 'free') return 'Downgrade'
    return 'Upgrade'
  }

  const getButtonVariant = (planId: string) => {
    if (planId === currentPlan) return 'outline'
    return 'default'
  }

  const getPlanColor = (color: string) => {
    switch (color) {
      case 'blue': return 'border-blue-200 bg-blue-50'
      case 'gold': return 'border-yellow-200 bg-yellow-50'
      default: return 'border-gray-200 bg-gray-50'
    }
  }

  const getIconColor = (color: string) => {
    switch (color) {
      case 'blue': return 'text-blue-600'
      case 'gold': return 'text-yellow-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">
          Choose Your Plan
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          Unlock powerful features to take your betting game to the next level
        </p>
      </div>

      {/* Billing Toggle */}
      <div className="flex justify-center">
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

      {/* Plans Grid */}
      <div className="grid gap-8 lg:grid-cols-3">
        {plans.map((plan) => {
          const Icon = plan.icon
          const isCurrentPlan = plan.id === currentPlan
          const yearlyPrice = billingPeriod === 'yearly' && plan.price > 0 
            ? getDiscountedPrice(plan.price) 
            : plan.price * 12

          return (
            <Card 
              key={plan.id} 
              className={`relative ${plan.popular ? 'ring-2 ring-blue-500' : ''} ${
                isCurrentPlan ? getPlanColor(plan.color) : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-500 text-white px-3 py-1">
                    Most Popular
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center ${
                  plan.color === 'blue' ? 'bg-blue-100' :
                  plan.color === 'gold' ? 'bg-yellow-100' : 'bg-gray-100'
                }`}>
                  <Icon className={`h-6 w-6 ${getIconColor(plan.color)}`} />
                </div>
                
                <CardTitle className="text-2xl font-bold">
                  {plan.name}
                  {isCurrentPlan && (
                    <Badge variant="outline" className="ml-2 text-xs">
                      Current
                    </Badge>
                  )}
                </CardTitle>
                
                <CardDescription className="text-gray-600">
                  {plan.description}
                </CardDescription>

                <div className="mt-4">
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold text-gray-900">
                      ${billingPeriod === 'yearly' && plan.price > 0 
                        ? (getDiscountedPrice(plan.price) / 12).toFixed(2)
                        : plan.price === 0 ? '0' : plan.price
                      }
                    </span>
                    {plan.price > 0 && (
                      <span className="text-gray-600 ml-1">
                        /{billingPeriod === 'yearly' ? 'month' : plan.period}
                      </span>
                    )}
                  </div>
                  
                  {billingPeriod === 'yearly' && plan.price > 0 && (
                    <div className="mt-1 text-sm text-gray-600">
                      <span className="line-through">${plan.price * 12}/year</span>
                      <span className="text-green-600 font-medium ml-2">
                        Save ${(plan.price * 12 * 0.2).toFixed(0)}
                      </span>
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Features List */}
                <div className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      {feature.included ? (
                        <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                      ) : (
                        <X className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      )}
                      <span className={`text-sm ${
                        feature.included ? 'text-gray-900' : 'text-gray-500'
                      }`}>
                        {feature.name}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Action Button */}
                <Button
                  className="w-full mt-6"
                  variant={getButtonVariant(plan.id)}
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={isCurrentPlan && plan.id !== 'free'}
                >
                  {getButtonText(plan.id)}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Feature Highlights */}
      <div className="bg-gray-50 rounded-xl p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">
            Why Choose AI Betting Assistant?
          </h2>
          <p className="mt-2 text-gray-600">
            Powerful features designed to improve your betting performance
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="text-center">
            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Smart Analytics</h3>
            <p className="text-sm text-gray-600">
              Advanced insights into your betting patterns and performance
            </p>
          </div>

          <div className="text-center">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <Receipt className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Receipt Scanning</h3>
            <p className="text-sm text-gray-600">
              AI-powered OCR to automatically extract bet details from receipts
            </p>
          </div>

          <div className="text-center">
            <div className="mx-auto w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <Smartphone className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Mobile App</h3>
            <p className="text-sm text-gray-600">
              Track bets on the go with our native mobile applications
            </p>
          </div>

          <div className="text-center">
            <div className="mx-auto w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
              <Zap className="h-6 w-6 text-yellow-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">AI Insights</h3>
            <p className="text-sm text-gray-600">
              Get personalized recommendations to improve your betting strategy
            </p>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-white">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">
              Can I change my plan anytime?
            </h3>
            <p className="text-sm text-gray-600">
              Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately for upgrades, and at the next billing cycle for downgrades.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-2">
              What payment methods do you accept?
            </h3>
            <p className="text-sm text-gray-600">
              We accept all major credit cards (Visa, MasterCard, American Express) and PayPal. All payments are processed securely through Stripe.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-2">
              Is there a free trial for paid plans?
            </h3>
            <p className="text-sm text-gray-600">
              We offer a generous free plan to get started. You can try premium features with a 7-day free trial when you upgrade to Plus or Premium.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-2">
              How does receipt scanning work?
            </h3>
            <p className="text-sm text-gray-600">
              Our AI-powered OCR technology automatically extracts bet information from photos of your betting receipts, saving you time on manual entry.
            </p>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="text-center bg-blue-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Need help choosing a plan?
        </h3>
        <p className="text-gray-600 mb-4">
          Our team is here to help you find the perfect plan for your needs.
        </p>
        <Button variant="outline">
          <CreditCard className="mr-2 h-4 w-4" />
          Contact Sales
        </Button>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && paymentPlan && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false)
            setPaymentPlan(null)
          }}
          planId={paymentPlan.id}
          planName={paymentPlan.name}
          amount={paymentPlan.amount}
          billingPeriod={billingPeriod}
        />
      )}
    </div>
  )
}