
import { Outlet, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { LayoutDashboard, Users, LogOut, ScanLine, Menu, X, TrendingUp, Shield } from 'lucide-react'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard')({
  component: DashboardLayout,
})

export function DashboardLayout() {
    const navigate = useNavigate()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [isSuperuser, setIsSuperuser] = useState(false)

    useEffect(() => {
        const checkUser = async () => {
            const token = localStorage.getItem('access_token')
            if (!token) {
                navigate({ to: '/login' })
                return
            }

            try {
                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8001'
                const res = await fetch(`${apiUrl}/api/me/`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                if (res.ok) {
                    const data = await res.json()
                    setIsSuperuser(data.is_superuser)
                }
            } catch (err) {
                console.error("Failed to fetch user info", err)
            }
        }
        checkUser()
    }, [navigate])

    const handleLogout = () => {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        navigate({ to: '/login' })
    }

    const closeMobileMenu = () => {
        setMobileMenuOpen(false)
    }

    return (
        <div className="flex bg-black min-h-screen relative overflow-hidden font-outfit text-white">
            {/* Mobile Menu Button */}
            <div className="md:hidden fixed top-4 right-4 z-50">
                <button 
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="p-2 bg-white/10 rounded-full text-white backdrop-blur-md border border-white/20"
                >
                    {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Overlay */}
            {mobileMenuOpen && (
                <div 
                    className="fixed inset-0 bg-black/80 z-40 md:hidden backdrop-blur-sm transition-opacity"
                    onClick={closeMobileMenu}
                />
            )}

            {/* Sidebar */}
            <div className={`
                fixed md:static inset-y-0 left-0 bg-[#111] border-r border-white/10 w-64 p-6 flex flex-col justify-between 
                transition-transform duration-300 z-50 md:translate-x-0
                ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div>
                    <div className="mb-10 pt-2 px-2">
                        <Link to="/" className="text-2xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-500">
                            WAAKYE FEST
                        </Link>
                    </div>
                    
                    <nav className="space-y-2">
                        <Link 
                            to="/dashboard" 
                            className="flex items-center space-x-3 px-4 py-3 rounded-lg text-white transition-all duration-200 group"
                            activeProps={{
                                className: "bg-gradient-to-r from-yellow-500/10 to-transparent border-l-2 border-yellow-500 text-yellow-400"
                            }}
                            inactiveProps={{
                                className: "hover:bg-white/5 text-gray-400 hover:text-white"
                            }}
                            activeOptions={{ exact: true }}
                            onClick={closeMobileMenu}
                        >
                            <LayoutDashboard size={20} className="group-hover:text-yellow-400 transition-colors" />
                            <span>Overview</span>
                        </Link>
                        
                        <Link 
                            to="/dashboard/check-in" 
                            className="flex items-center space-x-3 px-4 py-3 rounded-lg text-white transition-all duration-200 group"
                            activeProps={{
                                className: "bg-gradient-to-r from-yellow-500/10 to-transparent border-l-2 border-yellow-500 text-yellow-400"
                            }}
                            inactiveProps={{
                                className: "hover:bg-white/5 text-gray-400 hover:text-white"
                            }}
                            onClick={closeMobileMenu}
                        >
                            <ScanLine size={20} className="group-hover:text-yellow-400 transition-colors" />
                            <span>Check-in</span>
                        </Link>

                        <Link 
                            to="/dashboard/attendees" 
                            className="flex items-center space-x-3 px-4 py-3 rounded-lg text-white transition-all duration-200 group"
                            activeProps={{
                                className: "bg-gradient-to-r from-yellow-500/10 to-transparent border-l-2 border-yellow-500 text-yellow-400"
                            }}
                            inactiveProps={{
                                className: "hover:bg-white/5 text-gray-400 hover:text-white"
                            }}
                            onClick={closeMobileMenu}
                        >
                            <Users size={20} className="group-hover:text-yellow-400 transition-colors" />
                            <span>Attendees</span>
                        </Link>

                        <Link 
                            to="/dashboard/analytics" 
                            className="flex items-center space-x-3 px-4 py-3 rounded-lg text-white transition-all duration-200 group"
                            activeProps={{
                                className: "bg-gradient-to-r from-yellow-500/10 to-transparent border-l-2 border-yellow-500 text-yellow-400"
                            }}
                            inactiveProps={{
                                className: "hover:bg-white/5 text-gray-400 hover:text-white"
                            }}
                            onClick={closeMobileMenu}
                        >
                            <TrendingUp size={20} className="group-hover:text-yellow-400 transition-colors" />
                            <span>Analytics</span>
                        </Link>

                        {isSuperuser && (
                            <Link 
                                to="/dashboard/organizers" 
                                className="flex items-center space-x-3 px-4 py-3 rounded-lg text-white transition-all duration-200 group"
                                activeProps={{
                                    className: "bg-gradient-to-r from-yellow-500/10 to-transparent border-l-2 border-yellow-500 text-yellow-400"
                                }}
                                inactiveProps={{
                                    className: "hover:bg-white/5 text-gray-400 hover:text-white"
                                }}
                                onClick={closeMobileMenu}
                            >
                                <Shield size={20} className="group-hover:text-purple-400 transition-colors" />
                                <span>Organizers</span>
                            </Link>
                        )}
                    </nav>
                </div>

                <div className="p-4 border-t border-white/10 relative z-10">
                    <button 
                        onClick={handleLogout}
                        className="flex items-center space-x-3 px-4 py-3 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-lg w-full transition"
                    >
                        <LogOut size={20} />
                        <span>Sign Out</span>
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto bg-[#0a0a0a] relative">
               {/* Mobile Menu Trigger (hidden as duplicated in fixed overlay logic but keep if needed for layout flow?) 
                   Actually the fixed button above is better.
                */}
                
                <div className="pt-0 md:pt-0"> {/* Adjusted padding */}
                    <Outlet />
                </div>
            </main>
        </div>
    )
}
