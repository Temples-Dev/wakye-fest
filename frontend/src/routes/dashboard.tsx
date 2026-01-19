
import { Outlet, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { Link } from '@tanstack/react-router'
import { LayoutDashboard, Users, CreditCard, LogOut, Settings as SettingsIcon, ScanLine } from 'lucide-react'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard')({
  component: DashboardLayout,
})

export function DashboardLayout() {
    const navigate = useNavigate()

    useEffect(() => {
        const token = localStorage.getItem('access_token')
        if (!token) {
            navigate({ to: '/login' })
        }
    }, [navigate])

    const handleLogout = () => {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        navigate({ to: '/login' })
    }

    return (
        <div className="flex h-screen bg-[#050505] font-outfit text-white">
            {/* Sidebar */}
            <aside className="w-64 bg-black border-r border-white/10 flex flex-col relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-[#1a472a]/20 to-transparent pointer-events-none" />
                
                <div className="p-6 border-b border-white/10 relative z-10">
                    <h1 className="text-2xl font-extrabold tracking-tight">
                         <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                            WAAKYE FEST
                        </span>
                    </h1>
                    <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest">Admin Console</p>
                </div>
                
                <nav className="flex-1 p-4 space-y-2 relative z-10">
                    <Link 
                        to="/dashboard" 
                        className="flex items-center space-x-3 px-4 py-3 rounded-lg text-white transition-all duration-200 group"
                        activeProps={{
                            className: "bg-gradient-to-r from-yellow-500/10 to-transparent border-l-2 border-yellow-500 text-yellow-400"
                        }}
                        inactiveProps={{
                            className: "hover:bg-white/5 text-gray-400 hover:text-white"
                        }}  
                    >
                        <LayoutDashboard size={20} className="group-hover:text-yellow-400 transition-colors" />
                        <span>Overview</span>
                    </Link>

                    <Link 
                        to="/dashboard/settings" 
                        className="flex items-center space-x-3 px-4 py-3 rounded-lg text-white transition-all duration-200 group"
                        activeProps={{
                            className: "bg-gradient-to-r from-yellow-500/10 to-transparent border-l-2 border-yellow-500 text-yellow-400"
                        }}
                        inactiveProps={{
                            className: "hover:bg-white/5 text-gray-400 hover:text-white"
                        }}
                    >
                        <SettingsIcon size={20} className="group-hover:text-yellow-400 transition-colors" />
                        <span>Settings</span>
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
                    >
                        <ScanLine size={20} className="group-hover:text-yellow-400 transition-colors" />
                        <span>Check-in</span>
                    </Link>
                   
                   {/* Placeholder links for future expansion */}
                    <div className="flex items-center space-x-3 px-4 py-3 text-gray-600 rounded-lg cursor-not-allowed opacity-50">
                        <Users size={20} />
                        <span>Attendees</span>
                    </div>
                    <div className="flex items-center space-x-3 px-4 py-3 text-gray-600 rounded-lg cursor-not-allowed opacity-50">
                        <CreditCard size={20} />
                        <span>Revenues</span>
                    </div>
                </nav>

                <div className="p-4 border-t border-white/10 relative z-10">
                    <button 
                        onClick={handleLogout}
                        className="flex items-center space-x-3 px-4 py-3 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-lg w-full transition"
                    >
                        <LogOut size={20} />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto bg-[#0a0a0a]">
                <Outlet />
            </main>
        </div>
    )
}
