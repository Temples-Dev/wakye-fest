import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Save } from 'lucide-react'

export const Route = createFileRoute('/dashboard/settings')({
  component: Settings,
})

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8001'

function Settings() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [settings, setSettings] = useState({
        name: '',
        date: '',
        time: '',
        location: ''
    })

    useEffect(() => {
        fetchSettings()
    }, [])

    const fetchSettings = async () => {
        try {
            const res = await fetch(`${apiUrl}/api/settings/`)
            if (res.ok) {
                const data = await res.json()
                setSettings({
                    name: data.name,
                    date: data.date,
                    time: data.time,
                    location: data.location
                })
            }
        } catch (error) {
            console.error("Failed to fetch settings", error)
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSettings({
            ...settings,
            [e.target.name]: e.target.value
        })
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        try {
            const token = localStorage.getItem('access_token')
            const res = await fetch(`${apiUrl}/api/settings/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(settings)
            })

            if (res.ok) {
                alert('Settings saved successfully!')
            } else {
                alert('Failed to save settings.')
            }
        } catch (error) {
            console.error("Failed to save settings", error)
            alert('Error saving settings.')
        } finally {
            setSaving(false)
        }
    }

    if (loading) return <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin text-white" /></div>

    return (
        <div className="p-8 space-y-8 min-h-full text-white">
            <div>
                <h2 className="text-2xl font-bold">Event Settings</h2>
                <p className="text-gray-400">Manage your event details here.</p>
            </div>

            <Card className="bg-[#111] border-white/10 max-w-2xl">
                <CardHeader>
                    <CardTitle className="text-white">General Information</CardTitle>
                    <CardDescription className="text-gray-400">These details will be displayed on the public landing page and tickets.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSave} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-gray-300">Event Name</Label>
                            <Input 
                                id="name" 
                                name="name" 
                                value={settings.name} 
                                onChange={handleChange} 
                                className="bg-white/5 border-white/10 text-white" 
                            />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="date" className="text-gray-300">Date</Label>
                                <Input 
                                    id="date" 
                                    name="date" 
                                    value={settings.date} 
                                    onChange={handleChange} 
                                    className="bg-white/5 border-white/10 text-white" 
                                    placeholder="e.g. Dec 24, 2026"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="time" className="text-gray-300">Time</Label>
                                <Input 
                                    id="time" 
                                    name="time" 
                                    value={settings.time} 
                                    onChange={handleChange} 
                                    className="bg-white/5 border-white/10 text-white" 
                                    placeholder="e.g. 10:00 AM"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="location" className="text-gray-300">Location</Label>
                            <Input 
                                id="location" 
                                name="location" 
                                value={settings.location} 
                                onChange={handleChange} 
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
        </div>
    )
}
