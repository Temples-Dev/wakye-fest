import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { 
    Card, 
    CardContent, 
    CardDescription, 
    CardHeader, 
    CardTitle 
} from '@/components/ui/card'
import { Loader2, TrendingUp, Users, DollarSign, Calendar } from 'lucide-react'
import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    LineChart,
    Line
} from 'recharts'

export const Route = createFileRoute('/dashboard/analytics')({
  component: Analytics,
})

interface EventAnalytics {
    id: string
    name: string
    date: string
    is_active: boolean
    tickets_sold: number
    checked_in: number
    total_revenue: number
}

function Analytics() {
    const [events, setEvents] = useState<EventAnalytics[]>([])
    const [loading, setLoading] = useState(true)
    const [yoyData, setYoyData] = useState<any>(null)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('access_token')
                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8001'
                
                // Fetch Events Data
                const resEvents = await fetch(`${apiUrl}/api/analytics/events/`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                const eventsData = await resEvents.json()
                setEvents(eventsData)

                // Fetch YoY Data
                const resYoy = await fetch(`${apiUrl}/api/analytics/yoy/`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                const yoy = await resYoy.json()
                
                // Transform YoY for charts
                const chartData = yoy.labels.map((label: string, i: number) => ({
                    name: label,
                    Revenue: yoy.revenue[i],
                    Sales: yoy.sales[i]
                }))
                setYoyData(chartData)

            } catch (error) {
                console.error("Failed to fetch analytics", error)
            } finally {
                setLoading(false)
            }
        }
        
        fetchData()
    }, [])

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
            </div>
        )
    }

    // Aggregate totals
    const totalRevenue = events.reduce((sum, e) => sum + e.total_revenue, 0)
    const totalTickets = events.reduce((sum, e) => sum + e.tickets_sold, 0)
    const activeEvent = events.find(e => e.is_active)

    return (
        <div className="p-8 space-y-8 min-h-full text-white">
            <div>
                <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-500">
                    Analytics Dashboard
                </h2>
                <p className="text-gray-400">Track performance metrics across all events.</p>
            </div>

            {/* Top Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-[#111] border-white/10">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">₵ {totalRevenue.toLocaleString()}</div>
                        <p className="text-xs text-gray-500">All time revenue</p>
                    </CardContent>
                </Card>
                <Card className="bg-[#111] border-white/10">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400">Total Tickets Sold</CardTitle>
                        <Users className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{totalTickets.toLocaleString()}</div>
                        <p className="text-xs text-gray-500">Across {events.length} events</p>
                    </CardContent>
                </Card>
                <Card className="bg-[#111] border-white/10">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400">Active Event</CardTitle>
                        <Calendar className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-lg font-bold text-white truncate">
                            {activeEvent ? activeEvent.name : 'None'}
                        </div>
                        <p className="text-xs text-gray-500">
                            {activeEvent ? `${activeEvent.tickets_sold} sold` : 'No active event'}
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-[#111] border-white/10">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400">Growth</CardTitle>
                        <TrendingUp className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">
                             {events.length > 1 ? '+15%' : '---'}
                        </div>
                        <p className="text-xs text-gray-500">Year over year</p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4 bg-[#111] border-white/10">
                    <CardHeader>
                        <CardTitle className="text-white">Revenue Overview</CardTitle>
                        <CardDescription className="text-gray-400">
                             Revenue comparison across events.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <ResponsiveContainer width="100%" height={350}>
                            <BarChart data={yoyData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                <XAxis dataKey="name" stroke="#888" />
                                <YAxis stroke="#888" />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#111', border: '1px solid #333' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Bar dataKey="Revenue" fill="#22c55e" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                <Card className="col-span-3 bg-[#111] border-white/10">
                    <CardHeader>
                        <CardTitle className="text-white">Ticket Sales Trend</CardTitle>
                        <CardDescription className="text-gray-400">
                            Ticket sales volume over time.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                         <ResponsiveContainer width="100%" height={350}>
                            <LineChart data={yoyData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                <XAxis dataKey="name" stroke="#888" />
                                <YAxis stroke="#888" />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#111', border: '1px solid #333' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Line type="monotone" dataKey="Sales" stroke="#eab308" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
            
            {/* Detailed Table */}
             <Card className="bg-[#111] border-white/10">
                <CardHeader>
                    <CardTitle className="text-white">Event Performance</CardTitle>
                </CardHeader>
                <CardContent>
                     <div className="relative w-full overflow-auto">
                        <table className="w-full caption-bottom text-sm text-left">
                            <thead className="[&_tr]:border-b border-white/10">
                                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                    <th className="h-12 px-4 align-middle font-medium text-gray-400">Event Name</th>
                                    <th className="h-12 px-4 align-middle font-medium text-gray-400">Date</th>
                                    <th className="h-12 px-4 align-middle font-medium text-gray-400">Status</th>
                                    <th className="h-12 px-4 align-middle font-medium text-gray-400">Tickets Sold</th>
                                    <th className="h-12 px-4 align-middle font-medium text-gray-400">Revenue</th>
                                </tr>
                            </thead>
                            <tbody className="[&_tr:last-child]:border-0">
                                {events.map((event) => (
                                    <tr key={event.id} className="border-b border-white/10 transition-colors hover:bg-white/5">
                                        <td className="p-4 align-middle font-medium text-white">{event.name}</td>
                                        <td className="p-4 align-middle text-gray-300">{event.date}</td>
                                        <td className="p-4 align-middle">
                                            {event.is_active ? (
                                                <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs font-bold border border-green-500/50">Active</span>
                                            ) : (
                                                <span className="bg-gray-500/20 text-gray-400 px-2 py-1 rounded text-xs font-bold border border-gray-500/50">Past</span>
                                            )}
                                        </td>
                                        <td className="p-4 align-middle text-white">{event.tickets_sold}</td>
                                        <td className="p-4 align-middle text-green-400 font-mono">₵ {event.total_revenue.toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
             </Card>
        </div>
    )
}
