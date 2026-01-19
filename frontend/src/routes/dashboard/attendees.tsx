import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from '@/components/ui/table'
import { 
    Card, 
    CardContent, 
    CardDescription, 
    CardHeader, 
    CardTitle 
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, ChevronLeft, ChevronRight, Loader2, CheckCircle } from 'lucide-react'

export const Route = createFileRoute('/dashboard/attendees')({
  component: Attendees,
})

interface Attendee {
    id: string
    name: string
    email: string
    phone_number: string
    short_code: string
    verified: boolean
    checked_in: boolean
    created_at: string
}

interface PaginatedResponse {
    count: number
    next: string | null
    previous: string | null
    results: Attendee[]
}

function Attendees() {
    const [attendees, setAttendees] = useState<Attendee[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [eventName, setEventName] = useState('General Admission')
    
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8001'
                const res = await fetch(`${apiUrl}/api/settings/`)
                if (res.ok) {
                    const data = await res.json()
                    setEventName(data.name || 'General Admission')
                }
            } catch (error) {
                console.error("Failed to fetch settings", error)
            }
        }
        fetchSettings()
    }, [])
    
    const fetchAttendees = async () => {
        setLoading(true)
        try {
            const token = localStorage.getItem('access_token')
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8001'
            const res = await fetch(`${apiUrl}/api/transactions/?page=${page}&search=${search}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            if (res.ok) {
                const data: PaginatedResponse = await res.json()
                setAttendees(data.results)
                setTotalPages(Math.ceil(data.count / 10)) // Assuming page size 10
            }
        } catch (error) {
            console.error("Failed to fetch attendees", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchAttendees()
        }, 500) // Debounce search
        return () => clearTimeout(timer)
    }, [search, page])

    return (
        <div className="p-8 space-y-8 min-h-full text-white">
            <div>
                <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-500">
                    Attendees
                </h2>
                <p className="text-gray-400">Manage and view all ticket holders.</p>
            </div>

            <Card className="bg-[#111] border-white/10">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <div className="space-y-1">
                        <CardTitle className="text-white">All Attendees</CardTitle>
                        <CardDescription className="text-gray-400">
                            List of all registered attendees and their status.
                        </CardDescription>
                    </div>
                    <div className="relative w-64">
                         <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                        <Input 
                            placeholder="Search name, email, code..." 
                            className="pl-8 bg-white/5 border-white/10 text-white"
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value)
                                setPage(1) // Reset to first page on search
                            }}
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border border-white/10">
                        <Table>
                            <TableHeader className="bg-white/5">
                                <TableRow className="border-white/10 hover:bg-transparent">
                                    <TableHead className="text-gray-400">Attendee</TableHead>
                                    <TableHead className="text-gray-400">Details</TableHead>
                                    <TableHead className="text-gray-400">Ticket Code</TableHead>
                                    <TableHead className="text-gray-400">Status</TableHead>
                                    <TableHead className="text-gray-400">Check-in</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">
                                            <div className="flex justify-center items-center gap-2">
                                                <Loader2 className="h-4 w-4 animate-spin text-yellow-500" />
                                                Loading...
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : attendees.length === 0 ? (
                                    <TableRow>
                                         <TableCell colSpan={5} className="h-24 text-center text-gray-500">
                                            No attendees found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    attendees.map((attendee) => (
                                        <TableRow key={attendee.id} className="border-white/10 hover:bg-white/5">
                                            <TableCell>
                                                <div className="font-medium text-white">{attendee.name}</div>
                                                <div className="text-xs text-gray-500 uppercase">{eventName}</div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-gray-300">{attendee.email}</div>
                                                <div className="text-xs text-gray-500">{attendee.phone_number}</div>
                                            </TableCell>
                                            <TableCell className="font-mono text-yellow-500">
                                                {attendee.short_code || '---'}
                                            </TableCell>
                                            <TableCell>
                                                {attendee.verified ? (
                                                    <Badge className="bg-green-500/20 text-green-400 border-green-500/50 hover:bg-green-500/20">Paid</Badge>
                                                ) : (
                                                    <Badge variant="outline" className="text-yellow-500 border-yellow-500/50">Pending</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {attendee.checked_in ? (
                                                    <div className="flex items-center text-green-400">
                                                        <CheckCircle className="h-4 w-4 mr-1" />
                                                        <span className="text-xs font-bold">In</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center text-gray-500">
                                                        <span className="text-xs">Not yet</span>
                                                    </div>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-end space-x-2 py-4">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1 || loading}
                            className="bg-transparent border-white/10 text-white hover:bg-white/10"
                        >
                            <ChevronLeft className="h-4 w-4" />
                            Previous
                        </Button>
                        <div className="text-sm text-gray-400">
                            Page {page} of {totalPages || 1}
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages || loading}
                            className="bg-transparent border-white/10 text-white hover:bg-white/10"
                        >
                            Next
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
