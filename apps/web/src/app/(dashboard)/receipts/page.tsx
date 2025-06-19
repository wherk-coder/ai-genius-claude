'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ReceiptUpload } from '@/components/receipts/ReceiptUpload'
import { ReceiptHistory } from '@/components/receipts/ReceiptHistory'
import { Upload, History, FileImage } from 'lucide-react'

export default function ReceiptsPage() {
  const [activeTab, setActiveTab] = useState<'upload' | 'history'>('upload')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Receipt Scanner</h1>
          <p className="text-gray-600">
            Upload betting receipts for automatic data extraction
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 rounded-lg bg-gray-100 p-1">
        <button
          onClick={() => setActiveTab('upload')}
          className={`flex items-center space-x-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
            activeTab === 'upload'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Upload className="h-4 w-4" />
          <span>Upload Receipt</span>
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center space-x-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
            activeTab === 'history'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <History className="h-4 w-4" />
          <span>Receipt History</span>
        </button>
      </div>

      {/* Content */}
      {activeTab === 'upload' ? (
        <div className="space-y-6">
          {/* Upload Instructions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileImage className="h-5 w-5" />
                <span>How It Works</span>
              </CardTitle>
              <CardDescription>
                Our AI-powered scanner automatically extracts bet information from your receipts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center">
                  <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                    <span className="text-lg font-semibold text-blue-600">1</span>
                  </div>
                  <h3 className="font-medium">Upload Receipt</h3>
                  <p className="text-sm text-gray-600">
                    Drop or select your betting receipt image
                  </p>
                </div>
                <div className="text-center">
                  <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                    <span className="text-lg font-semibold text-green-600">2</span>
                  </div>
                  <h3 className="font-medium">AI Processing</h3>
                  <p className="text-sm text-gray-600">
                    Our scanner extracts bet details automatically
                  </p>
                </div>
                <div className="text-center">
                  <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                    <span className="text-lg font-semibold text-purple-600">3</span>
                  </div>
                  <h3 className="font-medium">Review & Save</h3>
                  <p className="text-sm text-gray-600">
                    Verify details and add to your bet tracker
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Upload Component */}
          <ReceiptUpload />
        </div>
      ) : (
        <ReceiptHistory />
      )}
    </div>
  )
}