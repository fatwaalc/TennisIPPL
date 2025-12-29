'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, CheckCircle2, XCircle, Eye, Home } from 'lucide-react'
import Image from "next/image"

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

interface Analysis {
  id: string
  status: string
  progress: number
  inputFile?: string
  startTime?: string
  completedTime?: string
  outputFile?: string
}

export default function HistoryPage() {
  const router = useRouter()
  const [history, setHistory] = useState<Analysis[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    try {
      const response = await fetch(`${API_URL}/api/history`)
      const data = await response.json()
      setHistory(data)
      setLoading(false)
    } catch (err) {
      console.error('Failed to fetch history:', err)
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50'
      case 'processing': return 'text-blue-600 bg-blue-50'
      case 'failed': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="w-5 h-5" />
      case 'processing': return <Clock className="w-5 h-5 animate-spin" />
      case 'failed': return <XCircle className="w-5 h-5" />
      default: return <Clock className="w-5 h-5" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white border-b border-accent/30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 relative">
                <Image src="/Logo Tennis IdentifAI.png" alt="Tennis IdentifAI" fill className="object-contain" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-primary">Tennis IdentifAI</h1>
                <p className="text-sm text-muted-foreground">Analysis History</p>
              </div>
            </div>
            <Button 
              onClick={() => router.push('/dashboard')}
              variant="outline"
              className="border-primary text-primary hover:bg-blue-50 bg-transparent"
            >
              <Home className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Analysis History</CardTitle>
            <CardDescription>
              View all your tennis video analyses
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
                <p className="mt-4 text-gray-600">Loading history...</p>
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 mb-4 text-lg">No analysis found</p>
                <p className="text-sm text-gray-500 mb-6">Start by uploading your first tennis video</p>
                <Button onClick={() => router.push('/analysis/upload')} size="lg">
                  Upload Video
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-5 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`p-2 rounded-lg ${getStatusColor(item.status)}`}>
                        {getStatusIcon(item.status)}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-lg text-gray-900">{item.inputFile || 'Unknown File'}</p>
                        <div className="text-sm text-gray-500 space-y-1 mt-1">
                          <p className="font-mono text-xs">ID: {item.id}</p>
                          {item.completedTime && (
                            <p>Completed: {new Date(item.completedTime).toLocaleString('en-US', {
                              dateStyle: 'medium',
                              timeStyle: 'short'
                            })}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right mr-4">
                        <span className={`text-sm font-semibold px-3 py-1 rounded-full ${getStatusColor(item.status)}`}>
                          {item.status.toUpperCase()}
                        </span>
                        {item.status === 'processing' && (
                          <p className="text-sm text-gray-500 mt-1">{item.progress}%</p>
                        )}
                      </div>
                    </div>
                    <Button
                      onClick={() => router.push(`/analysis/result/${item.id}`)}
                      size="lg"
                      variant={item.status === 'completed' ? 'default' : 'outline'}
                      className={item.status === 'completed' ? 'bg-primary hover:bg-blue-900' : ''}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}