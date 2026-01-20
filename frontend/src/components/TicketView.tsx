import QRCode from 'react-qr-code'

// Removed import of qrcode.react as it is not installed.
// Actually checking package.json, qrcode.react is NOT in dependencies.
// I will just use a placeholder QR code image or a simple div since I can't easily install new packages without user permission/network risk.
// Wait, I can simulate a QR code with a styled div pattern.

interface EventDetails {
    date: string
    time: string
    name?: string
}

interface TicketProps {
  name: string
  ticketId: string
  shortCode: string
  type: string
  eventDetails?: EventDetails
  price?: string
}

export const TicketView = ({ name, ticketId, shortCode, type, eventDetails, price }: TicketProps) => {
  // Default values if not provided
  const date = eventDetails?.date || "Dec 24, 2026"
  const time = eventDetails?.time || "12:00 PM"
  const eventName = eventDetails?.name || "WAAKYE FEST"
  
  return (
    <div className="relative w-full max-w-sm mx-auto bg-black border-2 border-yellow-500 rounded-3xl overflow-hidden shadow-[0_0_30px_rgba(234,179,8,0.3)] text-white font-mono">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-500 to-orange-600 p-6 text-center">
        <h2 className="text-3xl font-black text-black uppercase">{eventName}</h2>
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
                <div className="text-sm font-bold">{date}</div>
            </div>
            <div>
                <div className="text-gray-400 text-xs uppercase tracking-wider mb-1">Time</div>
                <div className="text-sm font-bold">{time}</div>
            </div>
            <div>
                 <div className="text-gray-400 text-xs uppercase tracking-wider mb-1">Cost</div>
                 <div className="text-sm font-bold text-yellow-500">GHS {price || '0.50'}</div>
            </div>
             <div>
                 <div className="text-gray-400 text-xs uppercase tracking-wider mb-1">Ticket ID</div>
                 <div className="text-lg font-bold text-white tracking-widest">{shortCode}</div>
            </div>
        </div>
      </div>

      {/* QR Code Section */}
      <div className="p-8 bg-zinc-950 flex flex-col items-center justify-center border-t-2 border-dashed border-gray-800 relative">
        {/* Cutout circles */}
        <div className="absolute -top-4 -left-4 w-8 h-8 bg-white rounded-full z-10"></div>
        <div className="absolute -top-4 -right-4 w-8 h-8 bg-white rounded-full z-10"></div>

        <div className="p-4 bg-white rounded-xl">
             <div className="h-32 w-32">
                <QRCode 
                    value={JSON.stringify({ id: ticketId, name, type })}
                    size={128}
                    style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                    viewBox={`0 0 128 128`}
                />
             </div>
        </div>

      </div>
    </div>
  )
}
