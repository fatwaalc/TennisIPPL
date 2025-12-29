'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { AlertCircle, CheckCircle2, Download, Home, Loader2, ExternalLink } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

interface AnalysisStatus {
  status: 'processing' | 'completed' | 'failed'
  progress: number
  outputFile?: string
  error?: string
  fileSize?: number
  completedTime?: string
}

export default function ResultPage() {
  const params = useParams()
  const router = useRouter()
  const [status, setStatus] = useState<AnalysisStatus | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [videoError, setVideoError] = useState<string | null>(null)

  const analysisId = params.id as string

  useEffect(() => {
    if (!analysisId) {
      setError('No analysis ID provided')
      setIsLoading(false)
      return
    }

    const checkStatus = async () => {
      try {
        console.log('Checking status for:', analysisId)
        const response = await fetch(`${API_URL}/api/analysis/${analysisId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        console.log('Status data:', data)
        
        setStatus(data)
        setError(null)
        setIsLoading(false)

        if (data.status === 'processing') {
          setTimeout(checkStatus, 2000)
        }
      } catch (err) {
        console.error('Error fetching status:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch analysis status')
        setIsLoading(false)
        
        if (status?.status === 'processing') {
          setTimeout(checkStatus, 3000)
        }
      }
    }

    checkStatus()
  }, [analysisId])

  const getVideoUrl = () => {
    if (status?.outputFile) {
      return `${API_URL}/api/video/${status.outputFile}`
    }
    return ''
  }

  const getDownloadUrl = () => {
    if (status?.outputFile) {
      return `${API_URL}/outputs/${status.outputFile}`
    }
    return ''
  }

  const handleDownload = () => {
    const downloadUrl = getDownloadUrl()
    if (downloadUrl) {
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = status?.outputFile || 'tennis_analysis.mp4'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const handleOpenNewTab = () => {
    const videoUrl = getVideoUrl()
    if (videoUrl) {
      window.open(videoUrl, '_blank')
    }
  }

  const renderContent = () => {
    if (isLoading) {
      return (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading Analysis...
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Fetching analysis status...
            </p>
          </CardContent>
        </Card>
      )
    }

    if (error) {
      return (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <div className="space-y-2">
              <p className="text-sm font-medium">Troubleshooting:</p>
              <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                <li>Check if backend is running: <code className="text-xs bg-muted px-1 py-0.5 rounded">npm start</code> in backend folder</li>
                <li>Test health endpoint: <a href={`${API_URL}/api/health`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{API_URL}/api/health</a></li>
                <li>Check browser console for CORS errors</li>
              </ul>
            </div>
            <Button onClick={() => window.location.reload()} className="mt-4">
              Retry
            </Button>
          </CardContent>
        </Card>
      )
    }

    if (!status) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>Analysis Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              The requested analysis could not be found.
            </p>
            <Button onClick={() => router.push('/')} className="mt-4">
              <Home className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </CardContent>
        </Card>
      )
    }

    if (status.status === 'processing') {
      return (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Processing Video
            </CardTitle>
            <CardDescription>
              Analysis ID: {analysisId}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span className="font-medium">{status.progress}%</span>
              </div>
              <Progress value={status.progress} />
            </div>
            <p className="text-sm text-muted-foreground">
              {status.progress < 25 && "Detecting players..."}
              {status.progress >= 25 && status.progress < 50 && "Detecting ball..."}
              {status.progress >= 50 && status.progress < 70 && "Analyzing court..."}
              {status.progress >= 70 && status.progress < 85 && "Calculating statistics..."}
              {status.progress >= 85 && "Generating output video..."}
            </p>
          </CardContent>
        </Card>
      )
    }

    if (status.status === 'failed') {
      return (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Analysis Failed
            </CardTitle>
            <CardDescription>
              Analysis ID: {analysisId}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              {status.error || 'An error occurred during analysis'}
            </p>
            <Button onClick={() => router.push('/analysis/upload')}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      )
    }

    if (status.status === 'completed') {
      const videoUrl = getVideoUrl()
      
      return (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="h-5 w-5" />
              Analysis Complete
            </CardTitle>
            <CardDescription>
              Analysis ID: {analysisId}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Video Player */}
            <div className="space-y-4">
              <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
                {videoUrl ? (
                  <video
                    key={videoUrl}
                    controls
                    className="w-full h-full"
                    preload="auto"
                    crossOrigin="anonymous"
                    onLoadStart={() => {
                      console.log('Video loading started:', videoUrl)
                      setVideoError(null)
                    }}
                    onLoadedMetadata={(e) => {
                      console.log('Video metadata loaded')
                      console.log('Duration:', e.currentTarget.duration)
                      console.log('Video dimensions:', e.currentTarget.videoWidth, 'x', e.currentTarget.videoHeight)
                    }}
                    onLoadedData={() => console.log('Video data loaded')}
                    onCanPlay={() => console.log('Video can play')}
                    onError={(e) => {
                      const video = e.currentTarget
                      const errorCode = video.error?.code
                      const errorMessage = video.error?.message
                      
                      console.error('Video error:', {
                        code: errorCode,
                        message: errorMessage,
                        src: video.src,
                        networkState: video.networkState,
                        readyState: video.readyState
                      })

                      let userMessage = 'Failed to load video. '
                      switch (errorCode) {
                        case 1: // MEDIA_ERR_ABORTED
                          userMessage += 'Video loading was aborted.'
                          break
                        case 2: // MEDIA_ERR_NETWORK
                          userMessage += 'Network error occurred.'
                          break
                        case 3: // MEDIA_ERR_DECODE
                          userMessage += 'Video decoding failed. The file may be corrupted.'
                          break
                        case 4: // MEDIA_ERR_SRC_NOT_SUPPORTED
                          userMessage += 'Video format not supported by browser.'
                          break
                        default:
                          userMessage += errorMessage || 'Unknown error.'
                      }

                      setVideoError(userMessage)
                    }}
                  >
                    <source src={videoUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <div className="flex items-center justify-center h-full text-white">
                    <div className="text-center">
                      <p className="mb-2">Video not available</p>
                      <p className="text-sm text-white/60">Output file: {status?.outputFile || 'None'}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Video Error Message */}
              {videoError && (
                <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium text-amber-500 text-sm">Video Loading Issue</p>
                    <p className="text-sm text-amber-500/80 mt-1">{videoError}</p>
                    <div className="mt-3 flex gap-2">
                      <Button size="sm" variant="outline" onClick={handleOpenNewTab}>
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Open in New Tab
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleDownload}>
                        <Download className="h-3 w-3 mr-1" />
                        Download File
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Alternative Access Methods */}
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleOpenNewTab}
                  className="flex-1"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Open in New Tab
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleDownload}
                  className="flex-1"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Video
                </Button>
              </div>
            </div>

            {/* Info */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">File Size</p>
                <p className="font-medium">
                  {status.fileSize 
                    ? `${(status.fileSize / (1024 * 1024)).toFixed(2)} MB`
                    : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Completed</p>
                <p className="font-medium">
                  {status.completedTime 
                    ? new Date(status.completedTime).toLocaleString()
                    : 'N/A'}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => router.push('/dashboard')}
                className="flex-1"
              >
                <Home className="mr-2 h-4 w-4" />
                Dashboard
              </Button>
              <Button 
                onClick={() => router.push('/analysis/upload')}
                className="flex-1"
              >
                Analyze Another Video
              </Button>
            </div>

            {/* Debug Info */}
            <details className="text-xs text-muted-foreground">
              <summary className="cursor-pointer hover:text-foreground">
                Debug Info
              </summary>
              <pre className="mt-2 p-2 bg-muted rounded overflow-x-auto text-xs">
                {JSON.stringify({ 
                  videoUrl, 
                  downloadUrl: getDownloadUrl(),
                  status,
                  videoError 
                }, null, 2)}
              </pre>
            </details>
          </CardContent>
        </Card>
      )
    }

    return null
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Analysis Result</h1>
        <p className="text-muted-foreground">
          View your tennis match analysis
        </p>
      </div>

      {renderContent()}
    </div>
  )
}