'use client'

import { useState, useCallback, useRef } from 'react'
import { useDropzone } from 'react-dropzone'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ImageCropper } from './ImageCropper'
import { 
  Upload, 
  X, 
  FileImage, 
  AlertCircle, 
  CheckCircle, 
  Loader2,
  Camera,
  File,
  Crop
} from 'lucide-react'
import apiClient from '@/lib/api-client'

interface UploadedFile {
  id: string
  file: File
  preview: string
  status: 'uploading' | 'cropping' | 'processing' | 'completed' | 'error'
  progress: number
  error?: string
  result?: any
}

export function ReceiptUpload() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [croppingFileId, setCroppingFileId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: UploadedFile[] = acceptedFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      preview: URL.createObjectURL(file),
      status: file.type.startsWith('image/') ? 'cropping' : 'uploading',
      progress: 0,
    }))

    setUploadedFiles(prev => [...prev, ...newFiles])

    // Process non-image files immediately (PDFs)
    newFiles.forEach(uploadedFile => {
      if (!uploadedFile.file.type.startsWith('image/')) {
        processFile(uploadedFile)
      }
    })
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg'],
      'application/pdf': ['.pdf']
    },
    maxFiles: 5,
    maxSize: 10 * 1024 * 1024, // 10MB
  })

  const processFile = async (uploadedFile: UploadedFile) => {
    try {
      // Simulate upload progress
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 100))
        setUploadedFiles(prev => 
          prev.map(f => 
            f.id === uploadedFile.id 
              ? { ...f, progress } 
              : f
          )
        )
      }

      // Update status to processing
      setUploadedFiles(prev => 
        prev.map(f => 
          f.id === uploadedFile.id 
            ? { ...f, status: 'processing', progress: 100 } 
            : f
        )
      )

      // Call receipt scanner API
      const formData = new FormData()
      formData.append('image', uploadedFile.file)

      // Note: This would call the actual receipt scanner service
      // For now, we'll simulate the API call
      const result = await simulateReceiptScan(uploadedFile.file)

      // Update with results
      setUploadedFiles(prev => 
        prev.map(f => 
          f.id === uploadedFile.id 
            ? { ...f, status: 'completed', result } 
            : f
        )
      )
    } catch (error) {
      setUploadedFiles(prev => 
        prev.map(f => 
          f.id === uploadedFile.id 
            ? { 
                ...f, 
                status: 'error', 
                error: error instanceof Error ? error.message : 'Upload failed' 
              } 
            : f
        )
      )
    }
  }

  // Simulate receipt scanning API call
  const simulateReceiptScan = async (file: File): Promise<any> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Mock OCR results
    return {
      sportsbook: 'DraftKings',
      betType: 'STRAIGHT',
      sport: 'NFL',
      amount: 25.00,
      odds: '+150',
      selection: 'Kansas City Chiefs ML',
      confidence: 0.92,
      extractedText: 'Mock extracted text from receipt...'
    }
  }

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => {
      const updated = prev.filter(f => f.id !== fileId)
      // Revoke object URL to prevent memory leaks
      const fileToRemove = prev.find(f => f.id === fileId)
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.preview)
      }
      return updated
    })
  }

  const retryFile = (fileId: string) => {
    const file = uploadedFiles.find(f => f.id === fileId)
    if (file) {
      const newStatus = file.file.type.startsWith('image/') ? 'cropping' : 'uploading'
      setUploadedFiles(prev => 
        prev.map(f => 
          f.id === fileId 
            ? { ...f, status: newStatus, progress: 0, error: undefined } 
            : f
        )
      )
      if (!file.file.type.startsWith('image/')) {
        processFile(file)
      }
    }
  }

  const startCropping = (fileId: string) => {
    setCroppingFileId(fileId)
  }

  const handleCropComplete = async (fileId: string, croppedImageBlob: Blob) => {
    // Create a new file from the cropped blob
    const originalFile = uploadedFiles.find(f => f.id === fileId)
    if (!originalFile) return

    const croppedFile = new (window as any).File(
      [croppedImageBlob], 
      `cropped_${originalFile.file.name}`,
      { type: 'image/jpeg' }
    ) as File

    // Update the file with cropped version and start processing
    setUploadedFiles(prev => 
      prev.map(f => 
        f.id === fileId 
          ? { ...f, file: croppedFile, status: 'uploading' } 
          : f
      )
    )

    setCroppingFileId(null)
    
    // Process the cropped file
    const updatedFile = { 
      ...originalFile, 
      file: croppedFile, 
      status: 'uploading' as const 
    }
    processFile(updatedFile)
  }

  const handleCropCancel = () => {
    setCroppingFileId(null)
  }

  const skipCropping = (fileId: string) => {
    const file = uploadedFiles.find(f => f.id === fileId)
    if (file) {
      setUploadedFiles(prev => 
        prev.map(f => 
          f.id === fileId 
            ? { ...f, status: 'uploading' } 
            : f
        )
      )
      processFile(file)
    }
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (files.length > 0) {
      onDrop(files)
    }
  }

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Receipt</CardTitle>
          <CardDescription>
            Drag and drop your betting receipt or click to browse
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
              isDragActive
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <input {...getInputProps()} />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,application/pdf"
              multiple
              onChange={handleFileInputChange}
              className="hidden"
            />
            
            <div className="space-y-4">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <Upload className="h-8 w-8 text-gray-400" />
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {isDragActive ? 'Drop your receipts here' : 'Upload your betting receipts'}
                </h3>
                <p className="text-gray-600 mt-1">
                  Supports PNG, JPG, and PDF files up to 10MB
                </p>
              </div>

              <div className="flex justify-center space-x-2">
                <Button variant="outline" onClick={openFileDialog}>
                  <FileImage className="mr-2 h-4 w-4" />
                  Browse Files
                </Button>
                <Button variant="outline">
                  <Camera className="mr-2 h-4 w-4" />
                  Take Photo
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Image Cropping Interface */}
      {croppingFileId && (
        (() => {
          const croppingFile = uploadedFiles.find(f => f.id === croppingFileId)
          return croppingFile ? (
            <ImageCropper
              imageFile={croppingFile.file}
              onCropComplete={(croppedBlob) => handleCropComplete(croppingFileId, croppedBlob)}
              onCancel={handleCropCancel}
            />
          ) : null
        })()
      )}

      {/* Upload Progress */}
      {uploadedFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Processing Receipts</CardTitle>
            <CardDescription>
              AI is extracting bet information from your receipts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {uploadedFiles.map((uploadedFile) => (
                <div key={uploadedFile.id} className="border rounded-lg p-4">
                  <div className="flex items-start space-x-4">
                    {/* File Preview */}
                    <div className="flex-shrink-0">
                      {uploadedFile.file.type.startsWith('image/') ? (
                        <img
                          src={uploadedFile.preview}
                          alt="Receipt preview"
                          className="w-16 h-16 object-cover rounded"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center">
                          <File className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* File Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {uploadedFile.file.name}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {(uploadedFile.file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {uploadedFile.status === 'cropping' && (
                            <Crop className="h-4 w-4 text-purple-500" />
                          )}
                          {uploadedFile.status === 'uploading' && (
                            <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                          )}
                          {uploadedFile.status === 'processing' && (
                            <Loader2 className="h-4 w-4 animate-spin text-yellow-500" />
                          )}
                          {uploadedFile.status === 'completed' && (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          )}
                          {uploadedFile.status === 'error' && (
                            <AlertCircle className="h-4 w-4 text-red-500" />
                          )}
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(uploadedFile.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Cropping Actions */}
                      {uploadedFile.status === 'cropping' && (
                        <div className="mt-2 flex items-center justify-between">
                          <p className="text-sm text-purple-600">Ready for cropping</p>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => startCropping(uploadedFile.id)}
                            >
                              <Crop className="h-3 w-3 mr-1" />
                              Crop
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => skipCropping(uploadedFile.id)}
                            >
                              Skip
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Progress Bar */}
                      {(uploadedFile.status === 'uploading' || uploadedFile.status === 'processing') && (
                        <div className="mt-2">
                          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                            <span>
                              {uploadedFile.status === 'uploading' ? 'Uploading...' : 'Processing...'}
                            </span>
                            <span>{uploadedFile.progress}%</span>
                          </div>
                          <Progress value={uploadedFile.progress} className="h-2" />
                        </div>
                      )}

                      {/* Error Message */}
                      {uploadedFile.status === 'error' && (
                        <div className="mt-2 flex items-center justify-between">
                          <p className="text-sm text-red-600">{uploadedFile.error}</p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => retryFile(uploadedFile.id)}
                          >
                            Retry
                          </Button>
                        </div>
                      )}

                      {/* Results Preview */}
                      {uploadedFile.status === 'completed' && uploadedFile.result && (
                        <div className="mt-3 p-3 bg-green-50 rounded border border-green-200">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="text-sm font-medium text-green-800">
                              Extraction Complete
                            </h5>
                            <span className="text-xs text-green-600">
                              {Math.round(uploadedFile.result.confidence * 100)}% confidence
                            </span>
                          </div>
                          <div className="grid gap-2 text-xs">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Sportsbook:</span>
                              <span className="font-medium">{uploadedFile.result.sportsbook}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Selection:</span>
                              <span className="font-medium">{uploadedFile.result.selection}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Amount:</span>
                              <span className="font-medium">${uploadedFile.result.amount}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Odds:</span>
                              <span className="font-medium">{uploadedFile.result.odds}</span>
                            </div>
                          </div>
                          <div className="mt-3 flex justify-end space-x-2">
                            <Button variant="outline" size="sm">
                              Edit Details
                            </Button>
                            <Button size="sm">
                              Add to Bets
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
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