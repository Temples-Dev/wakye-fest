
// Removed import of qrcode.react as it is not installed.
// Actually checking package.json, qrcode.react is NOT in dependencies.
// I will just use a placeholder QR code image or a simple div since I can't easily install new packages without user permission/network risk.
// Wait, I can simulate a QR code with a styled div pattern.

interface TicketProps {
  name: string
  ticketId: string
  type: string
}

export const TicketView = ({ name, ticketId }: TicketProps) => {
  return (
    <div className="relative w-full max-w-sm mx-auto bg-black border-2 border-yellow-500 rounded-3xl overflow-hidden shadow-[0_0_30px_rgba(234,179,8,0.3)] text-white font-mono">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-500 to-orange-600 p-6 text-center">
        <h2 className="text-3xl font-black text-black">WAAKYE FEST</h2>
        <p className="text-black font-bold tracking-widest">2026</p>
      </div>

      {/* Body */}
      <div className="p-6 space-y-6 relative">
        <div className="absolute -left-4 top-1/2 w-8 h-8 bg-black border-r-2 border-yellow-500 rounded-full transform -translate-y-1/2"></div>
        <div className="absolute -right-4 top-1/2 w-8 h-8 bg-black border-l-2 border-yellow-500 rounded-full transform -translate-y-1/2"></div>
        <div className="border-b-2 border-dashed border-gray-700 pb-6">
            <div className="text-gray-400 text-xs uppercase tracking-wider mb-1">Attendee</div>
            <div className="text-xl font-bold text-white">{name}</div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
            <div>
                <div className="text-gray-400 text-xs uppercase tracking-wider mb-1">Date</div>
                <div className="text-sm font-bold">Dec 24, 2026</div>
            </div>
            <div>
                <div className="text-gray-400 text-xs uppercase tracking-wider mb-1">Time</div>
                <div className="text-sm font-bold">12:00 PM</div>
            </div>
            <div>
                 <div className="text-gray-400 text-xs uppercase tracking-wider mb-1">Cost</div>
                 <div className="text-sm font-bold text-yellow-500">GHS 50.00</div>
            </div>
             <div>
                 <div className="text-gray-400 text-xs uppercase tracking-wider mb-1">Ticket ID</div>
                 <div className="text-xs font-bold text-gray-300">{ticketId.slice(0, 8)}</div>
            </div>
        </div>
      </div>

      {/* Footer / QR Placeholder */}
      <div className="p-6 bg-white/5 flex justify-center items-center">
        <div className="w-32 h-32 bg-white p-2 rounded-lg">
             {/* Simple visual placeholder for QR */}
            <div className="w-full h-full bg-black flex items-center justify-center text-xs text-center text-gray-500 p-1 break-all">
                [QR CODE: {ticketId}]
            </div>
        </div>
      </div>
    </div>
  )
}
