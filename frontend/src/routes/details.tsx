
import { useState, useEffect } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent } from '@/components/ui/card'
import { Calendar, Clock, MapPin, Music, Utensils, Zap } from 'lucide-react'
import Header from '@/components/Header'

export const Route = createFileRoute('/details')({
  component: Details,
})

export function Details() {
  const [settings, setSettings] = useState({
        date: 'December 24, 2026',
        time: '12:00 PM - 10:00 PM',
        location: 'Ho Jubilee Park, Ho'
  })

  useEffect(() => {
        const fetchSettings = async () => {
            try {
                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8001'
                const res = await fetch(`${apiUrl}/api/settings/`)
                if (res.ok) {
                    const data = await res.json()
                    setSettings(data)
                }
            } catch (error) {
                console.error("Failed to fetch settings", error)
            }
        }
        fetchSettings()
  }, [])

  return (
    <div className="min-h-screen bg-black pt-24 px-4 pb-12">
      <Header />
      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
            EVENT DETAILS
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Everything you need to know about the most anticipated food festival of the year.
          </p>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-zinc-900 border-zinc-800 text-white hover:border-yellow-500 transition-colors">
                <CardContent className="pt-6 text-center space-y-2">
                    <Calendar className="w-10 h-10 text-yellow-500 mx-auto mb-2" />
                    <h3 className="text-xl font-bold">Date</h3>
                    <p className="text-gray-400">{settings.date}</p>
                </CardContent>
            </Card>
            <Card className="bg-zinc-900 border-zinc-800 text-white hover:border-yellow-500 transition-colors">
                <CardContent className="pt-6 text-center space-y-2">
                    <Clock className="w-10 h-10 text-yellow-500 mx-auto mb-2" />
                    <h3 className="text-xl font-bold">Time</h3>
                    <p className="text-gray-400">{settings.time}</p>
                </CardContent>
            </Card>
            <Card className="bg-zinc-900 border-zinc-800 text-white hover:border-yellow-500 transition-colors">
                <CardContent className="pt-6 text-center space-y-2">
                    <MapPin className="w-10 h-10 text-yellow-500 mx-auto mb-2" />
                    <h3 className="text-xl font-bold">Location</h3>
                    <p className="text-gray-400">{settings.location}</p>
                </CardContent>
            </Card>
        </div>

        {/* Highlights */}
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white text-center">WHAT TO EXPECT</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex gap-4 items-start">
                    <div className="p-3 bg-yellow-500/10 rounded-lg">
                        <Utensils className="w-8 h-8 text-yellow-500" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white mb-2">Unlimited Waakye</h3>
                        <p className="text-gray-400">Taste variations from the best vendors across the Volta Region. Served hot with all the accompaniments.</p>
                    </div>
                </div>
                <div className="flex gap-4 items-start">
                    <div className="p-3 bg-yellow-500/10 rounded-lg">
                        <Music className="w-8 h-8 text-yellow-500" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white mb-2">Live Music</h3>
                        <p className="text-gray-400">Performances by top artists and DJs to keep the vibe going all day long.</p>
                    </div>
                </div>
                 <div className="flex gap-4 items-start">
                    <div className="p-3 bg-yellow-500/10 rounded-lg">
                        <Zap className="w-8 h-8 text-yellow-500" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white mb-2">Activities</h3>
                        <p className="text-gray-400">Eating competitions, cultural displays, and games for everyone.</p>
                    </div>
                </div>
            </div>
        </div>

      </div>
    </div>
  )
}
