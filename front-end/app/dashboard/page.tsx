"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Image from "next/image"
import Link from "next/link"
import { Clock, Upload, Play, History } from "lucide-react"

interface AnalysisRecord {
  id: string
  title: string
  date: string
  stats: {
    speed: number
    accuracy: number
    reaction: number
  }
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [records, setRecords] = useState<AnalysisRecord[]>([])

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push("/")
    } else {
      setUser(JSON.parse(userData))
      // Mock historical data
      setRecords([
        {
          id: "1",
          title: "Training Session - Smash Practice",
          date: "2024-11-12",
          stats: { speed: 95, accuracy: 88, reaction: 0.23 },
        },
        {
          id: "2",
          title: "Rally Analysis - Doubles",
          date: "2024-11-10",
          stats: { speed: 87, accuracy: 92, reaction: 0.19 },
        },
        {
          id: "3",
          title: "Warm-up Session",
          date: "2024-11-08",
          stats: { speed: 78, accuracy: 85, reaction: 0.26 },
        },
      ])
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("user")
    router.push("/")
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
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
                <p className="text-sm text-muted-foreground">Performance Analysis System</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-foreground font-medium">Welcome, {user.name}!</span>
              <Button
                onClick={() => router.push('/history')}
                variant="outline"
                className="border-primary text-primary hover:bg-blue-50 bg-transparent"
              >
                <History className="w-4 h-4 mr-2" />
                View History
              </Button>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="border-primary text-primary hover:bg-blue-50 bg-transparent"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Action Section - CENTERED UPLOAD */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">Start Your Analysis</h2>
          <div className="flex justify-center mb-12">
            <Link href="/analysis/upload" className="w-full max-w-md">
              <Card className="cursor-pointer hover:shadow-xl transition-all hover:scale-105">
                <div className="p-8 flex flex-col items-center justify-center gap-4 h-full min-h-[280px]">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-accent via-primary to-success flex items-center justify-center">
                    <Upload className="w-10 h-10 text-white" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-3xl font-bold text-primary mb-2">Upload Video</h3>
                    <p className="text-muted-foreground text-lg">Analyze your tennis performance video</p>
                  </div>
                  <Button className="mt-6 bg-primary hover:bg-blue-900 text-white text-base px-8 py-3 h-12">
                    Choose Video File
                  </Button>
                </div>
              </Card>
            </Link>
          </div>
        </section>

        {/* History Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Clock className="w-8 h-8 text-accent" />
              Recent Analysis
            </h2>
            <Link href="/history">
              <Button variant="outline" className="border-primary text-primary hover:bg-blue-50 bg-transparent">
                View All History
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {records.map((record) => (
              <Card key={record.id} className="overflow-hidden hover:shadow-lg transition-shadow group cursor-pointer">
                {/* Thumbnail */}
                <div className="relative h-40 bg-gradient-to-br from-accent to-primary overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-secondary/80 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Play className="w-6 h-6 text-white fill-white" />
                    </div>
                  </div>
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded text-xs font-semibold text-primary">
                    📹 Video
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-bold text-foreground mb-2 line-clamp-2">{record.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{record.date}</p>

                  {/* Stats */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Speed</span>
                      <span className="font-semibold text-primary">{record.stats.speed} km/h</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Accuracy</span>
                      <span className="font-semibold text-accent">{record.stats.accuracy}%</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Reaction</span>
                      <span className="font-semibold text-secondary">{record.stats.reaction}s</span>
                    </div>
                  </div>

                  <Button className="w-full mt-4 bg-primary hover:bg-blue-900 text-white h-9">View Analysis</Button>
                </div>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}