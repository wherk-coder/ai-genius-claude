'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Download, 
  CreditCard, 
  Calendar, 
  DollarSign,
  FileText,
  Settings,
  AlertCircle,
  CheckCircle,
  Clock,
  RefreshCw
} from 'lucide-react'

// Mock billing data
const currentSubscription = {
  plan: 'Plus',
  status: 'active',
  amount: 9.99,
  billingPeriod: 'monthly',
  nextBillingDate: '2024-02-15',
  cancelAtPeriodEnd: false
}

const billingHistory = [
  {
    id: 'inv_001',
    date: '2024-01-15',
    description: 'Plus Plan - Monthly',
    amount: 9.99,
    status: 'paid',
    downloadUrl: '/invoices/inv_001.pdf'
  },
  {
    id: 'inv_002',
    date: '2023-12-15',
    description: 'Plus Plan - Monthly',
    amount: 9.99,
    status: 'paid',
    downloadUrl: '/invoices/inv_002.pdf'
  },
  {
    id: 'inv_003',
    date: '2023-11-15',
    description: 'Plus Plan - Monthly',
    amount: 9.99,
    status: 'paid',
    downloadUrl: '/invoices/inv_003.pdf'
  },
  {
    id: 'inv_004',
    date: '2023-10-15',
    description: 'Plus Plan - Monthly',
    amount: 9.99,
    status: 'failed',
    downloadUrl: null
  },
  {
    id: 'inv_005',
    date: '2023-09-15',
    description: 'Plus Plan - Monthly',
    amount: 9.99,
    status: 'paid',
    downloadUrl: '/invoices/inv_005.pdf'
  }
]

const paymentMethods = [
  {
    id: 'pm_001',
    type: 'card',
    brand: 'visa',
    last4: '4242',
    expiryMonth: 12,
    expiryYear: 2025,
    isDefault: true
  },
  {
    id: 'pm_002',
    type: 'card',
    brand: 'mastercard',
    last4: '8888',
    expiryMonth: 8,
    expiryYear: 2026,
    isDefault: false
  }
]

export default function BillingPage() {
  const [isLoading, setIsLoading] = useState(false)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
      case 'active':
        return 'text-green-700 bg-green-100'
      case 'failed':
        return 'text-red-700 bg-red-100'
      case 'pending':
        return 'text-yellow-700 bg-yellow-100'
      default:
        return 'text-gray-700 bg-gray-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
      case 'active':
        return CheckCircle
      case 'failed':
        return AlertCircle
      case 'pending':
        return Clock
      default:
        return Clock
    }
  }

  const handleCancelSubscription = async () => {
    if (confirm('Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your billing period.')) {
      setIsLoading(true)
      // API call to cancel subscription
      setTimeout(() => {
        setIsLoading(false)
        // Update UI
      }, 2000)
    }
  }

  const handleReactivateSubscription = async () => {
    setIsLoading(true)
    // API call to reactivate subscription
    setTimeout(() => {
      setIsLoading(false)
      // Update UI
    }, 2000)
  }

  const handleDownloadInvoice = (downloadUrl: string) => {
    // In a real app, this would download the PDF
    window.open(downloadUrl, '_blank')
  }

  const getCardBrandIcon = (brand: string) => {
    // In a real app, you'd use actual card brand icons
    return brand.charAt(0).toUpperCase() + brand.slice(1)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Billing & Subscriptions</h1>
        <p className="text-gray-600">
          Manage your subscription, payment methods, and billing history
        </p>
      </div>

      {/* Current Subscription */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5" />
            <span>Current Subscription</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Plan</label>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-lg font-semibold">{currentSubscription.plan}</span>
                    <Badge className={getStatusColor(currentSubscription.status)}>
                      {currentSubscription.status}
                    </Badge>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Amount</label>
                  <div className="text-lg font-semibold mt-1">
                    ${currentSubscription.amount}/{currentSubscription.billingPeriod}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Next Billing Date</label>
                  <div className="text-lg font-semibold mt-1">
                    {formatDate(currentSubscription.nextBillingDate)}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Button variant="outline" className="w-full">
                <Settings className="mr-2 h-4 w-4" />
                Change Plan
              </Button>
              
              {currentSubscription.cancelAtPeriodEnd ? (
                <Button 
                  onClick={handleReactivateSubscription}
                  disabled={isLoading}
                  className="w-full"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  {isLoading ? 'Reactivating...' : 'Reactivate Subscription'}
                </Button>
              ) : (
                <Button 
                  variant="outline" 
                  onClick={handleCancelSubscription}
                  disabled={isLoading}
                  className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  {isLoading ? 'Cancelling...' : 'Cancel Subscription'}
                </Button>
              )}

              {currentSubscription.cancelAtPeriodEnd && (
                <div className="bg-yellow-50 p-3 rounded-md">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                    <div className="text-sm text-yellow-800">
                      <p className="font-medium">Subscription Cancelled</p>
                      <p>Your subscription will end on {formatDate(currentSubscription.nextBillingDate)}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5" />
              <span>Payment Methods</span>
            </CardTitle>
            <Button variant="outline" size="sm">
              Add Payment Method
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {paymentMethods.map((method) => (
              <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-8 bg-gray-100 rounded flex items-center justify-center text-xs font-medium">
                    {getCardBrandIcon(method.brand)}
                  </div>
                  <div>
                    <div className="font-medium">
                      •••• •••• •••• {method.last4}
                    </div>
                    <div className="text-sm text-gray-600">
                      Expires {method.expiryMonth}/{method.expiryYear}
                    </div>
                  </div>
                  {method.isDefault && (
                    <Badge variant="secondary">Default</Badge>
                  )}
                </div>
                <div className="flex space-x-2">
                  {!method.isDefault && (
                    <Button variant="ghost" size="sm">
                      Set as Default
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Billing History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Billing History</span>
          </CardTitle>
          <CardDescription>
            Download invoices and view payment history
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {billingHistory.map((invoice) => {
              const StatusIcon = getStatusIcon(invoice.status)
              
              return (
                <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <StatusIcon className={`h-5 w-5 ${
                      invoice.status === 'paid' ? 'text-green-600' :
                      invoice.status === 'failed' ? 'text-red-600' : 'text-yellow-600'
                    }`} />
                    <div>
                      <div className="font-medium">{invoice.description}</div>
                      <div className="text-sm text-gray-600">
                        {formatDate(invoice.date)} • Invoice #{invoice.id}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="font-semibold">${invoice.amount.toFixed(2)}</div>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getStatusColor(invoice.status)}`}
                      >
                        {invoice.status}
                      </Badge>
                    </div>
                    
                    {invoice.downloadUrl && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDownloadInvoice(invoice.downloadUrl!)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Load More */}
          <div className="text-center mt-6">
            <Button variant="outline">
              Load More History
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Billing Info */}
      <Card>
        <CardHeader>
          <CardTitle>Billing Information</CardTitle>
          <CardDescription>
            Update your billing address and tax information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-medium mb-2">Billing Address</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <div>John Doe</div>
                <div>123 Main Street</div>
                <div>New York, NY 10001</div>
                <div>United States</div>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Tax Information</h4>
              <div className="text-sm text-gray-600">
                <div>No tax ID on file</div>
              </div>
            </div>
          </div>
          <Button variant="outline" className="mt-4">
            Update Billing Information
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}