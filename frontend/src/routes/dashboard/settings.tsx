import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Save, Plus, Check } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

export const Route = createFileRoute('/dashboard/settings')({
  component: Settings,
})

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8001'

interface Event {
    id: number
    name: string
    date: string
    time: string
    location: string
    is_active: boolean
    ticket_price: string
}

function Settings() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [events, setEvents] = useState<Event[]>([])
    const [activeEvent, setActiveEvent] = useState<Event | null>(null)
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [newEvent, setNewEvent] = useState({
        name: '',
        date: '',
        time: '',
        time: '',
        location: '',
        ticket_price: '50.00'
    })

    useEffect(() => {
        fetchEvents()
    }, [])

    const fetchEvents = async () => {
        try {
            const token = localStorage.getItem('access_token')
            const res = await fetch(`${apiUrl}/api/analytics/events/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (res.ok) {
                const data = await res.json()
                setEvents(data)
                const active = data.find((e: Event) => e.is_active)
                setActiveEvent(active || null)
            }
        } catch (error) {
            console.error("Failed to fetch events", error)
        } finally {
            setLoading(false)
        }
    }

    const handleSetActive = async (eventId: number) => {
        setSaving(true)
        try {
            const token = localStorage.getItem('access_token')
            const res = await fetch(`${apiUrl}/api/events/${eventId}/set-active/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (res.ok) {
                fetchEvents()
                toast.success('Active event updated successfully!')
            } else {
                toast.error('Failed to set active event.')
            }
        } catch (error) {
            console.error("Failed to set active event", error)
            toast.error('Error setting active event.')
        } finally {
            setSaving(false)
        }
    }

    const handleCreateEvent = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        try {
            const token = localStorage.getItem('access_token')
            const res = await fetch(`${apiUrl}/api/events/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(newEvent)
            })

            if (res.ok) {
                setShowCreateModal(false)
                setNewEvent({ name: '', date: '', time: '', location: '' })
                fetchEvents()
                toast.success('Event created successfully!')
            } else {
                toast.error('Failed to create event.')
            }
        } catch (error) {
            console.error("Failed to create event", error)
            toast.error('Error creating event.')
        } finally {
            setSaving(false)
        }
    }

    const handleSaveActiveEvent = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!activeEvent) return
        
        setSaving(true)
        try {
            const token = localStorage.getItem('access_token')
            const res = await fetch(`${apiUrl}/api/settings/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: activeEvent.name,
                    date: activeEvent.date,
                    time: activeEvent.time,
                    location: activeEvent.location,
                    ticket_price: activeEvent.ticket_price
                })
            })

            if (res.ok) {
                fetchEvents()
                toast.success('Event details saved successfully!')
            } else {
                toast.error('Failed to save event details.')
            }
        } catch (error) {
            console.error("Failed to save event", error)
            toast.error('Error saving event.')
        } finally {
            setSaving(false)
        }
    }

    if (loading) return <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin text-white" /></div>

    return (
        <div className="p-8 space-y-8 min-h-full text-white">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-500">
                        Event Management
                    </h2>
                    <p className="text-gray-400">Manage your events and set which one is currently active.</p>
                </div>
                <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
                    <DialogTrigger asChild>
                        <Button className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold">
                            <Plus className="mr-2 h-4 w-4" />
                            Create New Event
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-[#1a1a1a] border-white/20 text-white shadow-2xl">
                        <DialogHeader>
                            <DialogTitle>Create New Event</DialogTitle>
                            <DialogDescription>
                                Add a new event for a future year.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleCreateEvent} className="space-y-4 pt-4">
                            <div className="grid gap-2">
                                <Label htmlFor="new-name">Event Name</Label>
                                <Input 
                                    id="new-name" 
                                    value={newEvent.name}
                                    onChange={e => setNewEvent({...newEvent, name: e.target.value})}
                                    className="bg-white/10 border-white/20 focus-visible:ring-yellow-500"
                                    placeholder="e.g. Waakye Fest 2027"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="new-date">Date</Label>
                                    <Input 
                                        id="new-date" 
                                        value={newEvent.date}
                                        onChange={e => setNewEvent({...newEvent, date: e.target.value})}
                                        className="bg-white/10 border-white/20 focus-visible:ring-yellow-500"
                                        placeholder="Dec 24, 2027"
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="new-time">Time</Label>
                                    <Input 
                                        id="new-time" 
                                        value={newEvent.time}
                                        onChange={e => setNewEvent({...newEvent, time: e.target.value})}
                                        className="bg-white/10 border-white/20 focus-visible:ring-yellow-500"
                                        placeholder="10:00 AM"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="new-location">Location</Label>
                                <Input 
                                    id="new-location" 
                                    value={newEvent.location}
                                    onChange={e => setNewEvent({...newEvent, location: e.target.value})}
                                    className="bg-white/10 border-white/20 focus-visible:ring-yellow-500"
                                    placeholder="Ho Jubilee Park, Ho"
                                    required
                                />
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={saving} className="bg-yellow-500 hover:bg-yellow-600 text-black">
                                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Create Event
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Active Event Editor */}
            {activeEvent && (
                <Card className="bg-[#111] border-white/10 max-w-2xl">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-white">Active Event Details</CardTitle>
                            <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
                                <Check className="mr-1 h-3 w-3" />
                                Active
                            </Badge>
                        </div>
                        <CardDescription className="text-gray-400">
                            These details will be displayed on the public landing page and new tickets.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSaveActiveEvent} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-gray-300">Event Name</Label>
                                <Input 
                                    id="name" 
                                    value={activeEvent.name} 
                                    onChange={e => setActiveEvent({...activeEvent, name: e.target.value})}
                                    className="bg-white/5 border-white/10 text-white" 
                                />
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="date" className="text-gray-300">Date</Label>
                                    <Input 
                                        id="date" 
                                        value={activeEvent.date} 
                                        onChange={e => setActiveEvent({...activeEvent, date: e.target.value})}
                                        className="bg-white/5 border-white/10 text-white" 
                                        placeholder="e.g. Dec 24, 2026"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="time" className="text-gray-300">Time</Label>
                                    <Input 
                                        id="time" 
                                        value={activeEvent.time} 
                                        onChange={e => setActiveEvent({...activeEvent, time: e.target.value})}
                                        className="bg-white/5 border-white/10 text-white" 
                                        placeholder="e.g. 10:00 AM"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="location" className="text-gray-300">Location</Label>
                                <Input 
                                    id="location" 
                                    value={activeEvent.location} 
                                    onChange={e => setActiveEvent({...activeEvent, location: e.target.value})}
                                    className="bg-white/5 border-white/10 text-white" 
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="price" className="text-gray-300">Ticket Price (GHS)</Label>
                                <Input 
                                    id="price" 
                                    type="number"
                                    step="0.01"
                                    value={activeEvent.ticket_price} 
                                    onChange={e => setActiveEvent({...activeEvent, ticket_price: e.target.value})}
                                    className="bg-white/5 border-white/10 text-white" 
                                />
                            </div>

                            <Button 
                                type="submit" 
                                className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold w-full md:w-auto"
                                disabled={saving}
                            >
                                {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : <><Save className="mr-2 h-4 w-4" /> Save Changes</>}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* All Events List */}
            <Card className="bg-[#111] border-white/10">
                <CardHeader>
                    <CardTitle className="text-white">All Events</CardTitle>
                    <CardDescription className="text-gray-400">
                        View all events and set which one is active for new ticket sales.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {events.map((event) => (
                            <div 
                                key={event.id}
                                className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition"
                            >
                                <div className="flex-1">
                                    <div className="flex items-center gap-3">
                                        <h3 className="font-bold text-white">{event.name}</h3>
                                        {event.is_active && (
                                            <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
                                                Active
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-400 mt-1">
                                        {event.date} • {event.time} • {event.location}
                                    </p>
                                </div>
                                {!event.is_active && (
                                    <Button
                                        onClick={() => handleSetActive(event.id)}
                                        disabled={saving}
                                        variant="outline"
                                        className="bg-transparent border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black"
                                    >
                                        Set as Active
                                    </Button>
                                )}
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
