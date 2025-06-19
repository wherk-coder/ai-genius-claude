'use client'

import { useState } from 'react'
import { StripePaymentForm } from './StripePaymentForm'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { X, CheckCircle, Crown, Star } from 'lucide-react'

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  planId: string
  planName: string
  amount: number
  billingPeriod: 'monthly' | 'yearly'
}

export function PaymentModal({ 
  isOpen, 
  onClose, 
  planId, 
  planName, 
  amount, 
  billingPeriod 
}: PaymentModalProps) {
  const [paymentStep, setPaymentStep] = useState<'confirm' | 'payment' | 'success'>('confirm')

  if (!isOpen) return null

  const handleConfirm = () => {
    setPaymentStep('payment')
  }

  const handlePaymentSuccess = () => {
    setPaymentStep('success')
    // Refresh user data, update UI, etc.
    setTimeout(() => {
      onClose()
      setPaymentStep('confirm') // Reset for next time
    }, 3000)
  }

  const handleCancel = () => {
    onClose()
    setPaymentStep('confirm') // Reset for next time
  }

  const getPlanIcon = () => {
    switch (planId) {
      case 'premium':
        return Crown
      case 'plus':
        return Star
      default:
        return Star
    }
  }

  const Icon = getPlanIcon()

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {paymentStep === 'confirm' && (
          <Card className="border-0">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle>Upgrade to {planName}</CardTitle>
                    <CardDescription>
                      Confirm your subscription details
                    </CardDescription>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Plan Benefits */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">
                  What you'll get with {planName}:
                </h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  {planId === 'plus' && (
                    <>
                      <li>✓ Unlimited bet tracking</li>
                      <li>✓ Advanced analytics & trends</li>
                      <li>✓ Receipt scanning (50/month)</li>
                      <li>✓ Basic AI insights</li>
                      <li>✓ Mobile app access</li>
                      <li>✓ Email support</li>
                    </>
                  )}
                  {planId === 'premium' && (
                    <>
                      <li>✓ Everything in Plus</li>
                      <li>✓ Unlimited receipt scanning</li>
                      <li>✓ Premium AI insights & predictions</li>
                      <li>✓ Advanced bankroll management</li>
                      <li>✓ Live odds comparison</li>
                      <li>✓ Priority customer support</li>
                      <li>✓ API access for integrations</li>
                    </>
                  )}
                </ul>
              </div>

              {/* Pricing Summary */}
              <div className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">{planName} Plan</span>
                  <span className="text-lg font-bold">${amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Billed {billingPeriod}</span>
                  {billingPeriod === 'yearly' && (
                    <span className="text-green-600 font-medium">Save 20%</span>
                  )}
                </div>
                {billingPeriod === 'yearly' && (
                  <div className="text-xs text-gray-500 mt-1">
                    Equivalent to ${(amount / 12).toFixed(2)}/month
                  </div>
                )}
              </div>

              {/* Terms */}
              <div className="text-xs text-gray-500 space-y-1">
                <p>• You can cancel anytime from your account settings</p>
                <p>• Downgrades take effect at the end of your current billing period</p>
                <p>• Upgrades are prorated and take effect immediately</p>
                <p>• All payments are processed securely through Stripe</p>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button onClick={handleConfirm}>
                  Continue to Payment
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {paymentStep === 'payment' && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Complete Your Payment</h2>
              <Button variant="ghost" size="sm" onClick={handleCancel}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <StripePaymentForm
              planId={planId}
              planName={planName}
              amount={amount}
              billingPeriod={billingPeriod}
              onSuccess={handlePaymentSuccess}
              onCancel={handleCancel}
            />
          </div>
        )}

        {paymentStep === 'success' && (
          <Card className="border-0">
            <CardContent className="text-center py-12">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Welcome to {planName}!
              </h2>
              
              <p className="text-gray-600 mb-6">
                Your subscription has been activated successfully. You now have access to all {planName} features.
              </p>

              <div className="bg-green-50 rounded-lg p-4 mb-6">
                <h3 className="font-medium text-green-800 mb-2">What's next?</h3>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Explore your new analytics dashboard</li>
                  <li>• Try the receipt scanning feature</li>
                  <li>• Download the mobile app</li>
                  <li>• Set up your betting preferences</li>
                </ul>
              </div>

              <p className="text-xs text-gray-500">
                This window will close automatically in a few seconds...
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}