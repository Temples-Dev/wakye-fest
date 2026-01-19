import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState, useMemo } from 'react'
import { 
    useReactTable, 
    getCoreRowModel, 
    flexRender,
    createColumnHelper,
} from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ChevronLeft, ChevronRight, Search, Loader2 } from 'lucide-react'

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8001'

interface Transaction {
    id: string
    name: string
    email: string
    paystack_reference: string
    phone_number: string
    verified: boolean
    created_at: string
}

interface Stats {
    total_revenue: number
    verified_tickets: number
    total_tickets: number
    recent_sales: Transaction[]
}

const columnHelper = createColumnHelper<Transaction>()

export const Route = createFileRoute('/dashboard/')({
  component: Dashboard,
})

export function Dashboard() {
    const [stats, setStats] = useState<Stats | null>(null)
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [loading, setLoading] = useState(true)
    const [tableLoading, setTableLoading] = useState(false)
    
    // Pagination & Search State
    const [page, setPage] = useState(1)
    const [search, setSearch] = useState('')
    const [totalPages, setTotalPages] = useState(1)
    const [totalCount, setTotalCount] = useState(0)

    // Fetch Stats (Global)
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem('access_token')
                const res = await fetch(`${apiUrl}/api/stats/`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })
                if (res.ok) {
                    const data = await res.json()
                    setStats(data)
                }
            } catch (error) {
                console.error("Failed to fetch stats", error)
            }
        }
        fetchStats()
    }, [])

    // Fetch Transactions (Paginated)
    useEffect(() => {
        const fetchTransactions = async () => {
            setTableLoading(true)
            try {
                const token = localStorage.getItem('access_token')
                const query = new URLSearchParams({
                    page: page.toString(),
                    search: search
                })
                
                const res = await fetch(`${apiUrl}/api/tickets/transactions/?${query}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })

                if (res.status === 401) {
                   // Let layout handle redirect, or handle refresh logic here
                   return
                }

                if (res.ok) {
                    const data = await res.json()
                    setTransactions(data.results)
                    setTotalCount(data.count)
                    setTotalPages(Math.ceil(data.count / 10)) // Assuming page size 10
                }
            } catch (error) {
                console.error("Failed to fetch transactions", error)
            } finally {
                setTableLoading(false)
                setLoading(false)
            }
        }

        const timeoutId = setTimeout(() => {
             fetchTransactions()
        }, 300) // Debounce search

        return () => clearTimeout(timeoutId)
    }, [page, search])

    const columns = useMemo(() => [
        columnHelper.accessor('name', {
            header: 'Name',
            cell: info => <span className="font-medium text-white">{info.getValue()}</span>
        }),
        columnHelper.accessor('email', {
            header: 'Email',
            cell: info => <span className="text-gray-400">{info.getValue()}</span>
        }),
        columnHelper.accessor('phone_number', {
            header: 'Phone',
            cell: info => <span className="text-gray-300">{info.getValue() || '-'}</span>
        }),
        columnHelper.accessor('paystack_reference', {
            header: 'Reference',
            cell: info => <span className="font-mono text-xs bg-white/10 text-gray-300 px-2 py-1 rounded">{info.getValue()}</span>
        }),
        columnHelper.accessor('verified', {
            header: 'Status',
            cell: info => (
                info.getValue() ? 
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900/40 text-green-400 border border-green-700/50">Verified</span> : 
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-900/40 text-yellow-500 border border-yellow-700/50">Pending</span>
            )
        }),
        columnHelper.accessor('created_at', {
            header: 'Date',
            cell: info => <span className="text-gray-400">{new Date(info.getValue()).toLocaleDateString() + ' ' + new Date(info.getValue()).toLocaleTimeString()}</span>
        }),
    ], [])

    const table = useReactTable({
        data: transactions,
        columns,
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true,
        pageCount: totalPages,
    })

    if (loading && !stats) return <div className="flex justify-center items-center h-full p-10"><Loader2 className="animate-spin text-gray-400" /></div>

    return (
        <div className="p-8 space-y-8 min-h-full">
            <div className="flex justify-between items-center">
                 <h2 className="text-2xl font-bold text-white">Dashboard</h2>
                 <div className="text-sm text-gray-500">Last updated: {new Date().toLocaleTimeString()}</div>
            </div>

            {/* Stats Grid */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-[#111] p-6 rounded-xl border border-white/5 relative overflow-hidden group hover:border-yellow-500/20 transition-colors">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/5 rounded-full blur-2xl -mr-10 -mt-10" />
                        <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider relative z-10">Total Revenue</h3>
                        <p className="text-3xl font-bold text-white mt-2 relative z-10">GHS {stats.total_revenue}</p>
                    </div>
                    <div className="bg-[#111] p-6 rounded-xl border border-white/5 relative overflow-hidden group hover:border-yellow-500/20 transition-colors">
                         <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-full blur-2xl -mr-10 -mt-10" />
                        <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider relative z-10">Tickets Sold</h3>
                        <p className="text-3xl font-bold text-white mt-2 relative z-10">{stats.verified_tickets}</p>
                    </div>
                    <div className="bg-[#111] p-6 rounded-xl border border-white/5 relative overflow-hidden group hover:border-yellow-500/20 transition-colors">
                         <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/5 rounded-full blur-2xl -mr-10 -mt-10" />
                         <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider relative z-10">Total Orders</h3>
                         <p className="text-3xl font-bold text-white mt-2 relative z-10">{stats.total_tickets}</p>
                    </div>
                </div>
            )}

            {/* Transactions Table */}
            <div className="bg-[#111] rounded-xl border border-white/5 overflow-hidden flex flex-col">
                <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#111]">
                    <h3 className="font-semibold text-lg text-white">Transactions</h3>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                        <Input 
                            placeholder="Search transactions..." 
                            className="pl-10 w-64 bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-yellow-500/50"
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value)
                                setPage(1) // Reset to page 1 on search
                            }}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto relative min-h-[400px]">
                    {tableLoading && (
                        <div className="absolute inset-0 bg-black/60 z-10 flex items-center justify-center backdrop-blur-sm">
                            <Loader2 className="animate-spin text-yellow-500" size={32} />
                        </div>
                    )}
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-white/5 text-gray-400 text-sm font-medium uppercase tracking-wider">
                            {table.getHeaderGroups().map(headerGroup => (
                                <tr key={headerGroup.id}>
                                    {headerGroup.headers.map(header => (
                                        <th key={header.id} className="p-4 border-b border-white/5">
                                            {flexRender(header.column.columnDef.header, header.getContext())}
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody className="divide-y divide-white/5 text-sm text-gray-300">
                            {table.getRowModel().rows.map(row => (
                                <tr key={row.id} className="hover:bg-white/5 transition-colors">
                                    {row.getVisibleCells().map(cell => (
                                        <td key={cell.id} className="p-4 align-middle">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                            {table.getRowModel().rows.length === 0 && !tableLoading && (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-gray-500">
                                        No transactions found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="p-4 border-t border-white/5 bg-white/5 flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                        Page {page} of {totalPages} ({totalCount} results)
                    </div>
                    <div className="space-x-2">
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1 || tableLoading}
                            className="border-white/10 bg-transparent text-gray-400 hover:text-white hover:bg-white/5 hover:border-white/20"
                        >
                            <ChevronLeft size={16} />
                        </Button>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages || tableLoading}
                             className="border-white/10 bg-transparent text-gray-400 hover:text-white hover:bg-white/5 hover:border-white/20"
                        >
                            <ChevronRight size={16} />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
