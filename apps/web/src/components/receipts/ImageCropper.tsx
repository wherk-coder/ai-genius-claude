'use client'

import { useState, useRef, useCallback } from 'react'
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  RotateCcw, 
  RotateCw, 
  Crop as CropIcon, 
  Download, 
  X, 
  RefreshCw,
  ZoomIn,
  ZoomOut,
  Move
} from 'lucide-react'
import 'react-image-crop/dist/ReactCrop.css'

interface ImageCropperProps {
  imageFile: File
  onCropComplete: (croppedImageBlob: Blob) => void
  onCancel: () => void
}

export function ImageCropper({ imageFile, onCropComplete, onCancel }: ImageCropperProps) {
  const [imgSrc, setImgSrc] = useState<string>('')
  const [crop, setCrop] = useState<Crop>()
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
  const [scale, setScale] = useState(1)
  const [rotate, setRotate] = useState(0)
  const imgRef = useRef<HTMLImageElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Load image when component mounts
  useState(() => {
    const reader = new FileReader()
    reader.addEventListener('load', () => {
      setImgSrc(reader.result?.toString() || '')
    })
    reader.readAsDataURL(imageFile)
  })

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget
    
    // Center crop with good default size for receipts (typically portrait)
    const crop = centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 80,
        },
        height / width, // aspect ratio for portrait receipts
        width,
        height,
      ),
      width,
      height,
    )
    setCrop(crop)
  }

  const handleRotate = (direction: 'left' | 'right') => {
    const newRotate = rotate + (direction === 'right' ? 90 : -90)
    setRotate(newRotate % 360)
  }

  const handleZoom = (direction: 'in' | 'out') => {
    const newScale = direction === 'in' 
      ? Math.min(scale + 0.1, 3) 
      : Math.max(scale - 0.1, 0.5)
    setScale(newScale)
  }

  const resetTransforms = () => {
    setScale(1)
    setRotate(0)
    setCrop(undefined)
  }

  async function generateCroppedImage() {
    if (!completedCrop || !imgRef.current || !canvasRef.current) {
      return
    }

    const image = imgRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      throw new Error('No 2d context')
    }

    const scaleX = image.naturalWidth / image.width
    const scaleY = image.naturalHeight / image.height

    const pixelRatio = window.devicePixelRatio
    canvas.width = Math.floor(completedCrop.width * scaleX * pixelRatio)
    canvas.height = Math.floor(completedCrop.height * scaleY * pixelRatio)

    ctx.scale(pixelRatio, pixelRatio)
    ctx.imageSmoothingQuality = 'high'

    const cropX = completedCrop.x * scaleX
    const cropY = completedCrop.y * scaleY

    const centerX = image.naturalWidth / 2
    const centerY = image.naturalHeight / 2

    ctx.save()

    // Move to center, rotate, then move back
    ctx.translate(-cropX, -cropY)
    ctx.translate(centerX, centerY)
    ctx.rotate((rotate * Math.PI) / 180)
    ctx.scale(scale, scale)
    ctx.translate(-centerX, -centerY)

    ctx.drawImage(
      image,
      0,
      0,
      image.naturalWidth,
      image.naturalHeight,
      0,
      0,
      image.naturalWidth,
      image.naturalHeight,
    )

    ctx.restore()

    return new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('Failed to generate cropped image'))
          }
        },
        'image/jpeg',
        0.9
      )
    })
  }

  const handleCropComplete = async () => {
    try {
      const croppedImageBlob = await generateCroppedImage()
      if (croppedImageBlob) {
        onCropComplete(croppedImageBlob)
      }
    } catch (error) {
      console.error('Error generating cropped image:', error)
    }
  }

  const previewCrop = useCallback(async () => {
    if (!completedCrop || !imgRef.current || !canvasRef.current) {
      return
    }

    await generateCroppedImage()
  }, [completedCrop, scale, rotate])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CropIcon className="h-5 w-5" />
            <span>Crop Receipt Image</span>
          </CardTitle>
          <CardDescription>
            Adjust the crop area to focus on your betting receipt. This helps improve OCR accuracy.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Transform Controls */}
          <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Transform:</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleRotate('left')}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleRotate('right')}
              >
                <RotateCw className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Zoom:</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleZoom('out')}
                disabled={scale <= 0.5}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-xs text-gray-600 min-w-[3rem] text-center">
                {Math.round(scale * 100)}%
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleZoom('in')}
                disabled={scale >= 3}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={resetTransforms}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>

          {/* Crop Interface */}
          <div className="flex justify-center mb-4">
            <div className="max-w-full max-h-96 overflow-auto border rounded-lg bg-gray-100">
              {imgSrc && (
                <ReactCrop
                  crop={crop}
                  onChange={(_, percentCrop) => setCrop(percentCrop)}
                  onComplete={(c) => setCompletedCrop(c)}
                  aspect={undefined}
                  minWidth={50}
                  minHeight={50}
                >
                  <img
                    ref={imgRef}
                    alt="Crop preview"
                    src={imgSrc}
                    style={{ 
                      transform: `scale(${scale}) rotate(${rotate}deg)`,
                      maxWidth: '100%',
                      maxHeight: '400px'
                    }}
                    onLoad={onImageLoad}
                  />
                </ReactCrop>
              )}
            </div>
          </div>

          {/* Preview Canvas (hidden) */}
          <canvas
            ref={canvasRef}
            style={{ display: 'none' }}
          />

          {/* Crop Instructions */}
          <div className="bg-blue-50 p-3 rounded-lg mb-4">
            <div className="flex items-start space-x-3">
              <Move className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">How to crop:</p>
                <ul className="space-y-1 text-xs">
                  <li>• Drag the corners to resize the crop area</li>
                  <li>• Drag the crop area to move it</li>
                  <li>• Use transform controls to rotate and zoom</li>
                  <li>• Focus on the bet details for best OCR results</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={onCancel}
            >
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>

            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={previewCrop}
                disabled={!completedCrop}
              >
                <Download className="mr-2 h-4 w-4" />
                Preview
              </Button>
              <Button
                onClick={handleCropComplete}
                disabled={!completedCrop}
              >
                <CropIcon className="mr-2 h-4 w-4" />
                Apply Crop
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Cropping Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-medium text-green-700 mb-2">✓ Good crops include:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Sportsbook name and logo</li>
                <li>• Bet amount and odds</li>
                <li>• Game/team information</li>
                <li>• Bet type (straight, parlay, etc.)</li>
                <li>• Date and time</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-red-700 mb-2">✗ Avoid including:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Blurry or cut-off text</li>
                <li>• Excessive white space</li>
                <li>• Other receipts in background</li>
                <li>• Personal information (if not needed)</li>
                <li>• Promotional content</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}