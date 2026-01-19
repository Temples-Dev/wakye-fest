import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useRef } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, CheckCircle, XCircle, Camera, CameraOff, Scan } from 'lucide-react'

export const Route = createFileRoute('/dashboard/check-in')({
  component: CheckIn,
})

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8001'

interface TicketData {
  id: string
  name: string
  short_code: string
  type?: string
}

interface CheckInResult {
  success: boolean
  message: string
  ticketId?: string
  timestamp: string
  attendees?: TicketData[]
}

function CheckIn() {
  const [scanning, setScanning] = useState(false)
  const [loading, setLoading] = useState(false)
  const [manualId, setManualId] = useState('')
  const [lastResult, setLastResult] = useState<CheckInResult | null>(null)
  const [recentCheckIns, setRecentCheckIns] = useState<CheckInResult[]>([])
  const [error, setError] = useState<string | null>(null)
  
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const lastScanRef = useRef<string>('')
  const scanTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleCheckIn = async (qrContent: string, isManualCode = false) => {
    // Prevent duplicate scans within 2 seconds (only for QR)
    if (!isManualCode && lastScanRef.current === qrContent && scanTimeoutRef.current) {
      return
    }

    if (!isManualCode) {
        lastScanRef.current = qrContent
    }
    
    setLoading(true)
    setError(null)

    try {
      const token = localStorage.getItem('access_token')
      const body = isManualCode 
        ? { ticket_code: qrContent } 
        : { qr_code_content: qrContent }

      const res = await fetch(`${apiUrl}/api/check-in/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      })

      const data = await res.json()

      const result: CheckInResult = {
        success: res.ok,
        message: res.ok ? data.message : data.error || 'Check-in failed',
        ticketId: qrContent,
        timestamp: new Date().toLocaleTimeString(),
        attendees: data.attendees
      }

      setLastResult(result)
      
      if (result.success) {
        setRecentCheckIns(prev => [result, ...prev].slice(0, 10))
      }

      // Reset last scan after 2 seconds (only for QR)
      if (!isManualCode) {
          if (scanTimeoutRef.current) clearTimeout(scanTimeoutRef.current)
          scanTimeoutRef.current = setTimeout(() => {
            lastScanRef.current = ''
            scanTimeoutRef.current = null
          }, 2000)
      }

    } catch (err) {
      console.error('Check-in error:', err)
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }


  const startScanner = async () => {
    try {
      setError(null)
      const scanner = new Html5Qrcode('qr-reader')
      scannerRef.current = scanner

      // getCameras call and logic below...

      // Get list of available cameras
      let cameraId = ''
      try {
        const devices = await Html5Qrcode.getCameras()
        if (devices && devices.length) {
          // Prefer back camera (usually last in list on mobile)
          // or try to find one with 'back' in label
          const backCamera = devices.find(device => device.label.toLowerCase().includes('back'))
          cameraId = backCamera ? backCamera.id : devices[devices.length - 1].id
        }
      } catch (err) {
        console.warn('Error getting cameras:', err)
        // Fallback to simpler config if getCameras fails
      }

      await scanner.start(
        cameraId ? cameraId : { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 }
        },
        (decodedText) => {
          handleCheckIn(decodedText)
        },
        (_errorMessage) => {
          // parse error, ignore it.
        }
      )

      setScanning(true)
    } catch (err: any) {
      console.error('Scanner error:', err)
      
      let msg = 'Failed to start camera. '
      if (err?.name === 'NotAllowedError') {
        msg += 'Permission denied. Please allow camera access.'
      } else if (err?.name === 'NotFoundError') {
        msg += 'No camera found.'
      } else if (err?.name === 'NotReadableError') {
        msg += 'Camera is in use.'
      } else {
        msg += err.message || 'Please use manual entry.'
      }
      
      setError(msg)
    }
  }

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop()
        scannerRef.current.clear()
        scannerRef.current = null
        setScanning(false)
      } catch (err) {
        console.error('Error stopping scanner:', err)
      }
    }
  }

  const handleManualCheckIn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!manualId.trim()) return
    
    await handleCheckIn(manualId.trim(), true)
    setManualId('')
  }

  useEffect(() => {
    return () => {
      stopScanner()
      if (scanTimeoutRef.current) clearTimeout(scanTimeoutRef.current)
    }
  }, [])

  return (
    <div className="p-8 space-y-8 min-h-full text-white">
      <div>
        <h2 className="text-2xl font-bold">Check-in Scanner</h2>
        <p className="text-gray-400">Scan attendee tickets to verify and check them in</p>
      </div>

      {/* Scanner Card */}
      <Card className="bg-[#111] border-white/10 max-w-2xl">
        <CardHeader>
          <CardTitle className="text-white">QR Scanner</CardTitle>
          <CardDescription className="text-gray-400">
            {scanning ? 'Point camera at ticket QR code' : 'Click to start scanning'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Scanner Container */}
          <div className="relative">
            <div 
              id="qr-reader" 
              className={`w-full ${scanning ? 'block' : 'hidden'}`}
              style={{ border: '2px solid #444', borderRadius: '8px' }}
            />
            
            {!scanning && (
              <div className="w-full h-64 bg-black/40 border-2 border-dashed border-white/20 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Camera className="mx-auto h-16 w-16 text-gray-500 mb-4" />
                  <p className="text-gray-400">Camera inactive</p>
                </div>
              </div>
            )}
          </div>

          {/* Scanner Controls */}
          <div className="flex gap-4">
            {!scanning ? (
              <Button 
                onClick={startScanner}
                className="bg-green-600 hover:bg-green-700 text-white font-bold flex-1"
              >
                <Camera className="mr-2 h-4 w-4" />
                Start Scanner
              </Button>
            ) : (
              <Button 
                onClick={stopScanner}
                className="bg-red-600 hover:bg-red-700 text-white font-bold flex-1"
              >
                <CameraOff className="mr-2 h-4 w-4" />
                Stop Scanner
              </Button>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-900/40 border border-red-700/50 text-red-400 p-4 rounded-lg">
              <XCircle className="inline mr-2 h-5 w-5" />
              {error}
            </div>
          )}

          {/* Last Result */}
          {loading && (
            <div className="bg-blue-900/40 border border-blue-700/50 text-blue-400 p-4 rounded-lg flex items-center">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Processing check-in...
            </div>
          )}

          {!loading && lastResult && (
            <div className={`p-4 rounded-lg border ${
              lastResult.success 
                ? 'bg-green-900/40 border-green-700/50 text-green-400'
                : 'bg-red-900/40 border-red-700/50 text-red-400'
            }`}>
              <div className="flex items-center mb-2">
                  {lastResult.success ? (
                    <CheckCircle className="inline mr-2 h-5 w-5" />
                  ) : (
                    <XCircle className="inline mr-2 h-5 w-5" />
                  )}
                  <span className="font-semibold text-lg">{lastResult.message}</span>
                  <span className="text-sm ml-auto opacity-75">({lastResult.timestamp})</span>
              </div>
              
              {/* Display Attendees if available */}
              {lastResult.success && lastResult.attendees && lastResult.attendees.length > 0 && (
                  <div className="mt-4 space-y-2 border-t border-green-700/30 pt-4">
                      <p className="text-sm text-green-300 font-bold uppercase tracking-wider">Attendee Details</p>
                      {lastResult.attendees.map((attendee) => (
                          <div key={attendee.id} className="bg-black/30 p-3 rounded-md flex justify-between items-center">
                                <div>
                                    <p className="text-white font-bold text-lg">{attendee.name}</p>
                                    <p className="text-sm text-green-300/70">ID: {attendee.short_code || attendee.id.slice(0,8)}</p>
                                </div>
                                <div className="bg-green-500/20 text-green-300 px-2 py-1 rounded text-xs font-bold border border-green-500/30">
                                    VERIFIED
                                </div>
                          </div>
                      ))}
                  </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Manual Entry Card */}
      <Card className="bg-[#111] border-white/10 max-w-2xl">
        <CardHeader>
          <CardTitle className="text-white">Manual Entry</CardTitle>
          <CardDescription className="text-gray-400">Enter ticket ID manually if scanning fails</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleManualCheckIn} className="flex gap-2">
            <Input 
              value={manualId}
              onChange={(e) => setManualId(e.target.value)}
              placeholder="Enter 8-digit code (e.g. AB12CD34)"
              className="bg-white/5 border-white/10 text-white flex-1"
            />
            <Button 
              type="submit"
              disabled={loading || !manualId.trim()}
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold"
            >
              <Scan className="mr-2 h-4 w-4" />
              Check In
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Recent Check-ins */}
      {recentCheckIns.length > 0 && (
        <Card className="bg-[#111] border-white/10 max-w-2xl">
          <CardHeader>
            <CardTitle className="text-white">Recent Check-ins</CardTitle>
            <CardDescription className="text-gray-400">{recentCheckIns.length} successful check-ins</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentCheckIns.map((checkIn, idx) => (
                <div 
                  key={idx}
                  className="flex justify-between items-center p-3 bg-white/5 rounded-lg border border-white/10"
                >
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-400 mr-3" />
                    <span className="text-sm text-white">{checkIn.message}</span>
                  </div>
                  <span className="text-xs text-gray-500">{checkIn.timestamp}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
