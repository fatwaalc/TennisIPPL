'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Upload, Loader2, FileVideo, AlertCircle } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export default function UploadPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('video/')) {
        setError('Please select a valid video file')
        return
      }
      
      // Validate file size (max 500MB)
      if (file.size > 500 * 1024 * 1024) {
        setError('File size must be less than 500MB')
        return
      }

      setSelectedFile(file)
      setError(null)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file first')
      return
    }

    setIsUploading(true)
    setError(null)
    setUploadProgress(0)

    try {
      console.log('Starting upload for file:', selectedFile.name)
      
      const formData = new FormData()
      formData.append('video', selectedFile)

      // Test backend connection first
      try {
        const healthCheck = await fetch(`${API_URL}/api/health`, {
          method: 'GET',
        })
        
        if (!healthCheck.ok) {
          throw new Error('Backend server is not responding')
        }
        
        console.log('Backend health check passed')
      } catch (err) {
        console.error('Health check failed:', err)
        throw new Error('Cannot connect to backend server. Make sure it is running on http://localhost:5000')
      }

      // Upload with progress
      const xhr = new XMLHttpRequest()

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100)
          setUploadProgress(progress)
          console.log('Upload progress:', progress + '%')
        }
      })

      const uploadPromise = new Promise<any>((resolve, reject) => {
        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText)
              resolve(response)
            } catch (err) {
              reject(new Error('Invalid JSON response from server'))
            }
          } else {
            try {
              const errorResponse = JSON.parse(xhr.responseText)
              reject(new Error(errorResponse.error || `Upload failed with status ${xhr.status}`))
            } catch {
              reject(new Error(`Upload failed with status ${xhr.status}`))
            }
          }
        })

        xhr.addEventListener('error', () => {
          reject(new Error('Network error occurred during upload'))
        })

        xhr.addEventListener('abort', () => {
          reject(new Error('Upload was cancelled'))
        })

        xhr.open('POST', `${API_URL}/api/upload`)
        xhr.send(formData)
      })

      const result = await uploadPromise
      console.log('Upload successful:', result)

      if (result.analysisId) {
        // Redirect to result page
        router.push(`/analysis/result/${result.analysisId}`)
      } else {
        throw new Error('No analysis ID received from server')
      }

    } catch (err) {
      console.error('Upload error:', err)
      setError(err instanceof Error ? err.message : 'Failed to upload video')
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Upload Video</h1>
        <p className="text-muted-foreground">
          Upload a tennis match video for AI-powered analysis
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Video Upload</CardTitle>
          <CardDescription>
            Select a video file (MP4, MOV, AVI) - Max 500MB
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* File Input */}
          <div className="space-y-4">
            <div
              onClick={() => !isUploading && fileInputRef.current?.click()}
              className={`
                border-2 border-dashed rounded-lg p-12 text-center cursor-pointer
                transition-colors
                ${isUploading ? 'cursor-not-allowed opacity-50' : 'hover:border-primary hover:bg-accent'}
                ${error ? 'border-destructive' : 'border-border'}
              `}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={handleFileSelect}
                disabled={isUploading}
                className="hidden"
              />
              
              <div className="flex flex-col items-center gap-4">
                {isUploading ? (
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                ) : (
                  <FileVideo className="h-12 w-12 text-muted-foreground" />
                )}
                
                <div>
                  <p className="text-lg font-medium">
                    {selectedFile ? selectedFile.name : 'Click to select video'}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedFile 
                      ? `Size: ${formatFileSize(selectedFile.size)}`
                      : 'or drag and drop your video here'
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Upload Progress */}
            {isUploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Uploading...</span>
                  <span className="font-medium">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="flex items-start gap-2 p-4 bg-destructive/10 border border-destructive rounded-lg">
                <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-destructive">Error</p>
                  <p className="text-sm text-destructive/80 mt-1">{error}</p>
                  
                  {error.includes('Cannot connect to backend') && (
                    <div className="mt-3 space-y-1 text-sm">
                      <p className="font-medium">Troubleshooting:</p>
                      <ul className="list-disc list-inside space-y-1 text-destructive/70">
                        <li>Check if backend is running: <code className="text-xs bg-destructive/20 px-1 py-0.5 rounded">npm start</code> in backend folder</li>
                        <li>Test health endpoint: <a href={`${API_URL}/api/health`} target="_blank" rel="noopener noreferrer" className="underline">http://localhost:5000/api/health</a></li>
                        <li>Make sure port 5000 is not blocked by firewall</li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Upload Button */}
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
            className="w-full"
            size="lg"
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Uploading & Analyzing...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-5 w-5" />
                Upload & Analyze
              </>
            )}
          </Button>

          {/* Info */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <p className="text-sm font-medium mb-2">What we analyze:</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Player positions and movements</li>
              <li>• Ball trajectory and speed</li>
              <li>• Shot detection and statistics</li>
              <li>• Court line detection</li>
            </ul>
          </div>

          {/* Debug Info */}
          <details className="text-xs text-muted-foreground">
            <summary className="cursor-pointer hover:text-foreground">
              Debug Information
            </summary>
            <div className="mt-2 p-2 bg-muted rounded space-y-1">
              <p>API URL: {API_URL}</p>
              <p>File Selected: {selectedFile?.name || 'None'}</p>
              <p>File Size: {selectedFile ? formatFileSize(selectedFile.size) : 'N/A'}</p>
              <p>Uploading: {isUploading ? 'Yes' : 'No'}</p>
            </div>
          </details>
        </CardContent>
      </Card>
    </div>
  )
}