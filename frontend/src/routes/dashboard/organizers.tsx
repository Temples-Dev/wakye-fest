import { createFileRoute, useNavigate } from '@tanstack/react-router'
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
import { 
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Loader2, Trash2, Shield, Plus } from 'lucide-react'

export const Route = createFileRoute('/dashboard/organizers')({
  component: Organizers,
})

interface Organizer {
    id: number
    username: string
    email: string
    first_name: string
    last_name: string
    is_staff: boolean
    is_superuser: boolean
    date_joined: string
}

function Organizers() {
    const navigate = useNavigate()
    const [organizers, setOrganizers] = useState<Organizer[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [showAddModal, setShowAddModal] = useState(false)

    
    // Form state
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        first_name: '',
        last_name: ''
    })
    const [createLoading, setCreateLoading] = useState(false)

    const fetchOrganizers = async () => {
        setLoading(true)
        setError(null)
        try {
            const token = localStorage.getItem('access_token')
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8001'
            
            // Check permissions first via /me/ endpoint or just try fetching
            // Let's try fetching, if 403 handle it
            const res = await fetch(`${apiUrl}/api/organizers/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            
            if (res.status === 403) {
                setError("You do not have permission to view this page.")
                setLoading(false)
                return
            }
            
            if (res.ok) {
                const data = await res.json()
                setOrganizers(data)
            } else {
                setError("Failed to load organizers.")
            }
        } catch (error) {
            console.error("Failed to fetch organizers", error)
            setError("Network error.")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchOrganizers()
    }, [])

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        setCreateLoading(true)
        try {
            const token = localStorage.getItem('access_token')
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8001'
            
            const res = await fetch(`${apiUrl}/api/organizers/create/`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            })
            
            const data = await res.json()
            if (res.ok) {
                setShowAddModal(false)
                setFormData({ username: '', email: '', password: '', first_name: '', last_name: '' })
                fetchOrganizers() // Refresh list
            } else {
                alert(data.error || "Failed to create organizer")
            }
        } catch (err) {
            console.error(err)
            alert("Network error")
        } finally {
            setCreateLoading(false)
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to remove this organizer?")) return

        try {
            const token = localStorage.getItem('access_token')
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8001'
            
            const res = await fetch(`${apiUrl}/api/organizers/${id}/`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            })
            
            if (res.ok) {
                setOrganizers(prev => prev.filter(o => o.id !== id))
            } else {
                const data = await res.json()
                alert(data.error || "Failed decrease organizer")
            }
        } catch (err) {
            console.error(err)
            alert("Network error")
        }
    }

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="p-8 text-white min-h-full flex flex-col items-center justify-center">
                <Shield className="h-16 w-16 text-red-500 mb-4" />
                <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
                <p className="text-gray-400 mb-4">{error}</p>
                <Button onClick={() => navigate({ to: '/dashboard' })}>Return to Dashboard</Button>
            </div>
        )
    }

    return (
        <div className="p-8 space-y-8 min-h-full text-white">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-500">
                        Organizer Management
                    </h2>
                    <p className="text-gray-400">Manage staff access and permissions.</p>
                </div>
                <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
                    <DialogTrigger asChild>
                        <Button className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Organizer
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-[#1a1a1a] border-white/30 text-white shadow-2xl ring-1 ring-white/10">
                        <DialogHeader>
                            <DialogTitle>Add New Organizer</DialogTitle>
                            <DialogDescription>
                                Create a new staff account. They will have access to the dashboard.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleCreate} className="space-y-4 pt-4">
                            <div className="grid gap-2">
                                <Label htmlFor="username">Username</Label>
                                <Input 
                                    id="username" 
                                    value={formData.username}
                                    onChange={e => setFormData({...formData, username: e.target.value})}
                                    className="bg-white/10 border-white/20 focus-visible:ring-yellow-500"
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input 
                                    id="email" 
                                    type="email"
                                    value={formData.email}
                                    onChange={e => setFormData({...formData, email: e.target.value})}
                                    className="bg-white/10 border-white/20 focus-visible:ring-yellow-500"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="first_name">First Name</Label>
                                    <Input 
                                        id="first_name" 
                                        value={formData.first_name}
                                        onChange={e => setFormData({...formData, first_name: e.target.value})}
                                        className="bg-white/10 border-white/20 focus-visible:ring-yellow-500"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="last_name">Last Name</Label>
                                    <Input 
                                        id="last_name" 
                                        value={formData.last_name}
                                        onChange={e => setFormData({...formData, last_name: e.target.value})}
                                        className="bg-white/10 border-white/20 focus-visible:ring-yellow-500"
                                    />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="password">Password</Label>
                                <Input 
                                    id="password" 
                                    type="password"
                                    value={formData.password}
                                    onChange={e => setFormData({...formData, password: e.target.value})}
                                    className="bg-white/10 border-white/20 focus-visible:ring-yellow-500"
                                    required
                                />
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={createLoading} className="bg-yellow-500 hover:bg-yellow-600 text-black">
                                    {createLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Create Account
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card className="bg-[#111] border-white/10">
                <CardHeader>
                    <CardTitle className="text-white">Staff Accounts</CardTitle>
                    <CardDescription className="text-gray-400">
                        {organizers.length} registered organizers.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border border-white/10">
                        <Table>
                            <TableHeader className="bg-white/5">
                                <TableRow className="border-white/10 hover:bg-transparent">
                                    <TableHead className="text-gray-400">User</TableHead>
                                    <TableHead className="text-gray-400">Email</TableHead>
                                    <TableHead className="text-gray-400">Role</TableHead>
                                    <TableHead className="text-gray-400">Date Joined</TableHead>
                                    <TableHead className="text-right text-gray-400">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {organizers.map((org) => (
                                    <TableRow key={org.id} className="border-white/10 hover:bg-white/5">
                                        <TableCell>
                                            <div className="font-medium text-white">{org.username}</div>
                                            <div className="text-xs text-gray-500">
                                                {org.first_name} {org.last_name}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-gray-300">{org.email}</TableCell>
                                        <TableCell>
                                            {org.is_superuser ? (
                                                <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/50">Superuser</Badge>
                                            ) : (
                                                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/50">Staff</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-gray-400">
                                            {new Date(org.date_joined).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {!org.is_superuser && (
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon"
                                                    onClick={() => handleDelete(org.id)}
                                                    className="hover:bg-red-900/20 text-red-500 hover:text-red-400"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
