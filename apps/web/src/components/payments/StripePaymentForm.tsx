'use client'

import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle, CreditCard, Lock, Shield } from 'lucide-react'
import apiClient from '@/lib/api-client'

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '')

interface PaymentFormProps {
  planId: string
  planName: string
  amount: number
  billingPeriod: 'monthly' | 'yearly'
  onSuccess: () => void
  onCancel: () => void
}

function PaymentForm({ planId, planName, amount, billingPeriod, onSuccess, onCancel }: PaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [billingDetails, setBillingDetails] = useState({
    name: '',
    email: '',
    address: {
      line1: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'US'
    }
  })

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    
    if (!stripe || !elements) {
      return
    }

    setIsProcessing(true)
    setError(null)

    const cardElement = elements.getElement(CardElement)
    if (!cardElement) {
      setError('Card element not found')
      setIsProcessing(false)
      return
    }

    try {
      // Create payment method
      const { error: methodError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: billingDetails,
      })

      if (methodError) {
        setError(methodError.message || 'Failed to create payment method')
        setIsProcessing(false)
        return
      }

      // Create customer if needed
      const customer = await apiClient.createCustomer()

      // Create subscription or one-time payment
      if (planId === 'free') {
        // Handle downgrade to free
        onSuccess()
        return
      }

      // For paid plans, create subscription
      const subscription = await apiClient.createSubscription(
        customer.id,
        `price_${planId}_${billingPeriod}` // This would be actual Stripe price IDs
      )

      // Confirm payment if needed
      if (subscription.latest_invoice?.payment_intent?.status === 'requires_action') {
        const { error: confirmError } = await stripe.confirmCardPayment(
          subscription.latest_invoice.payment_intent.client_secret,
          {
            payment_method: paymentMethod.id
          }
        )

        if (confirmError) {
          setError(confirmError.message || 'Payment confirmation failed')
          setIsProcessing(false)
          return
        }
      }

      onSuccess()
    } catch (err: any) {
      setError(err.message || 'Payment failed. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#374151',
        fontFamily: 'system-ui, sans-serif',
        '::placeholder': {
          color: '#9CA3AF',
        },
      },
      invalid: {
        color: '#EF4444',
        iconColor: '#EF4444',
      },
    },
    hidePostalCode: false,
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5" />
            <span>Order Summary</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="font-medium">{planName} Plan</span>
              <span className="font-bold">${amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Billing: {billingPeriod}</span>
              {billingPeriod === 'yearly' && (
                <span className="text-green-600 font-medium">20% off</span>
              )}
            </div>
            <hr className="my-3" />
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>${amount.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Billing Information */}
      <Card>
        <CardHeader>
          <CardTitle>Billing Information</CardTitle>
          <CardDescription>
            Enter your billing details for payment processing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={billingDetails.name}
                onChange={(e) => setBillingDetails(prev => ({ ...prev, name: e.target.value }))}
                placeholder="John Doe"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={billingDetails.email}
                onChange={(e) => setBillingDetails(prev => ({ ...prev, email: e.target.value }))}
                placeholder="john@example.com"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={billingDetails.address.line1}
              onChange={(e) => setBillingDetails(prev => ({ 
                ...prev, 
                address: { ...prev.address, line1: e.target.value }
              }))}
              placeholder="123 Main St"
              required
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={billingDetails.address.city}
                onChange={(e) => setBillingDetails(prev => ({ 
                  ...prev, 
                  address: { ...prev.address, city: e.target.value }
                }))}
                placeholder="New York"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={billingDetails.address.state}
                onChange={(e) => setBillingDetails(prev => ({ 
                  ...prev, 
                  address: { ...prev.address, state: e.target.value }
                }))}
                placeholder="NY"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="zip">ZIP Code</Label>
              <Input
                id="zip"
                value={billingDetails.address.postal_code}
                onChange={(e) => setBillingDetails(prev => ({ 
                  ...prev, 
                  address: { ...prev.address, postal_code: e.target.value }
                }))}
                placeholder="10001"
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Method */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Method</CardTitle>
          <CardDescription>
            Enter your card information securely
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-3 border rounded-md">
              <CardElement options={cardElementOptions} />
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Shield className="h-4 w-4" />
              <span>Your payment information is encrypted and secure</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Payment Error
              </h3>
              <div className="mt-2 text-sm text-red-700">
                {error}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Security Notice */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="flex items-start space-x-3">
          <Lock className="h-5 w-5 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Secure Payment</p>
            <p>
              We use Stripe for secure payment processing. Your card information is never stored on our servers.
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isProcessing}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!stripe || isProcessing}
          className="min-w-[150px]"
        >
          {isProcessing ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Processing...</span>
            </div>
          ) : (
            `Pay $${amount.toFixed(2)}`
          )}
        </Button>
      </div>
    </form>
  )
}

export function StripePaymentForm(props: PaymentFormProps) {
  return (
    <Elements stripe={stripePromise}>
      <PaymentForm {...props} />
    </Elements>
  )
}