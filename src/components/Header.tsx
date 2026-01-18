import { Link } from '@tanstack/react-router'
import { Ticket } from 'lucide-react'

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 transition-all duration-300 bg-transparent backdrop-blur-[2px]">
      <div className="flex items-center gap-2">
        <Link to="/" className="text-2xl font-black tracking-tighter text-white">
          WAAKYE<span className="text-yellow-500">FEST</span>
        </Link>
      </div>
      
      <nav className="hidden md:flex items-center gap-8">
        <Link to="/" className="text-sm font-medium text-white/80 hover:text-white transition-colors">
          Home
        </Link>
        <Link to="/details" className="text-sm font-medium text-white/80 hover:text-white transition-colors">
          Details
        </Link>
        <Link to="/contact" className="text-sm font-medium text-white/80 hover:text-white transition-colors">
          Contact
        </Link>
      </nav>

      <div>
          <Link to="/buy-tickets">
            <button className="rounded-full bg-white/10 px-6 py-2 text-sm font-medium text-white backdrop-blur-md transition-colors hover:bg-white/20 border border-white/10">
                <span className="flex items-center gap-2">
                    <Ticket size={16} />
                    Buy Tickets
                </span>
            </button>
          </Link>
      </div>
    </header>
  )
}
