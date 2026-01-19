
import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { TicketView } from '@/components/TicketView'
import { toPng } from 'html-to-image'
import download from 'downloadjs'
import { usePaystackPayment } from 'react-paystack'
import { Loader2, Download, CheckCircle, Smartphone } from 'lucide-react'
import Header from '@/components/Header'

export const Route = createFileRoute('/buy-tickets')({
  component: BuyTickets,
})

type Step = 'quantity' | 'details' | 'payment' | 'success'

interface TicketData {
  id: string
  name: string
  short_code: string
  type: string
}

export function BuyTickets() {
  const [step, setStep] = useState<Step>('quantity')
  const [quantity, setQuantity] = useState(1)
  const [names, setNames] = useState<string[]>([''])
  const [phoneNumber, setPhoneNumber] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [isBulkDownloading, setIsBulkDownloading] = useState(false)
  const [tickets, setTickets] = useState<TicketData[]>([])

  const [network, setNetwork] = useState('MTN')
  const [email, setEmail] = useState('')
  const [reference, setReference] = useState((new Date()).getTime().toString())
  const [eventSettings, setEventSettings] = useState({
      date: 'Dec 24, 2026',
      time: '12:00 PM',
      name: 'WAAKYE FEST'
  })

  useEffect(() => {
      const fetchSettings = async () => {
          try {
              const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8001'
              const res = await fetch(`${apiUrl}/api/settings/`)
              if (res.ok) {
                  const data = await res.json()
                  setEventSettings(data)
              }
          } catch (error) {
              console.error("Failed to fetch settings", error)
          }
      }
      fetchSettings()
  }, [])

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value)
    if (val > 0 && val <= 10) {
      setQuantity(val)
      const newNames = [...names]
      if (val > names.length) {
        for (let i = names.length; i < val; i++) newNames.push('')
      } else {
        newNames.length = val
      }
      setNames(newNames)
    }
  }

  const handleNameChange = (index: number, value: string) => {
    const newNames = [...names]
    newNames[index] = value
    setNames(newNames)
  }

  const goToDetails = () => setStep('details')
  
  const goToPayment = () => {
    // Basic validation
    if (names.some(n => n.trim() === '')) {
      alert('Please enter all attendee names')
      return
    }
    // Update reference for new transaction attempt
    setReference((new Date()).getTime().toString())
    setStep('payment')
  }

  /* 
    Configuration for Paystack 
    NOTE: Using a placeholder public key. The user should replace this.
  */
  const config = {
      reference: reference, // Use state reference
      email: email,
      amount: quantity * 50 * 100, // Amount in pesewas
      publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || '',
      currency: 'GHS',
      channels: ['mobile_money', 'card'] as any, // Typed as any to bypass potential type issues with channel strings
      metadata: {
        custom_fields: [
            {
                display_name: "Mobile Number",
                variable_name: "mobile_number",
                value: phoneNumber
            },
            {
                display_name: "Network",
                variable_name: "network",
                value: network
            }
        ]
      }
  };

  const onSuccess = async (reference: any) => {
    console.log("Payment successful, reference:", reference)
    setIsProcessing(true) // Keep processing state while verifying
    
    try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
        const response = await fetch(`${apiUrl}/api/verify-payment/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                reference: reference.reference,
                name: names[0], // Primary contact
                names: names,   // All attendees
                email: email,
                phone_number: phoneNumber
            })
        })

        const data = await response.json()
        
        if (response.ok) {
             // Backend returns array of tickets with UUIDs
             // Map backend fields to frontend TicketData if needed
             // Backend serializer: id, name, email, ...
             // Frontend: id, name, type
             
             const backendTickets = data.map((t: any) => ({
                 id: t.id,
                 name: t.name,
                 short_code: t.short_code,
                  type: eventSettings.name || 'General Admission'
             }))
             
             setTickets(backendTickets)
             setStep('success')
        } else {
             console.error('Backend verification failed:', data)
             alert(`Verification failed: ${data.error || 'Unknown error'}`)
        }
    } catch (error) {
        console.error('Network error:', error)
        alert('Could not verify payment with backend server. Please contact support.')
    } finally {
        setIsProcessing(false)
    }
  };

  const onClose = () => {
    setIsProcessing(false)
    alert('Payment cancelled')
  }

  const initializePayment = usePaystackPayment(config);

  const handlePayment = async () => {
    if (phoneNumber.length !== 10) {
       alert('Please enter a valid 10-digit mobile number')
       return
    }
    if (!email || !email.includes('@')) {
        alert('Please enter a valid email address')
        return
    }
    
    setIsProcessing(true)

    try {
        // Initiate transaction on backend
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
        const res = await fetch(`${apiUrl}/api/initiate-payment/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                reference: reference, // Use state reference
                email: email,
                phone_number: phoneNumber,
                names: names,
                name: names[0] // Fallback
            })
        })

        if (!res.ok) {
            const data = await res.json()
            throw new Error(data.error || 'Failed to initiate transaction')
        }

        // Proceed to Paystack
        initializePayment({onSuccess, onClose})
        
    } catch (error) {
        console.error("Payment initiation failed", error)
        alert('Could not initiate payment. Please try again.')
        setIsProcessing(false)
    }
  }

  const downloadTicket = async (id: string) => {
    const node = document.getElementById(`ticket-element-${id}`)
    if (!node) return

    try {
        const dataUrl = await toPng(node, { cacheBust: true })
        download(dataUrl, `waakye-fest-ticket-${id}.png`)
    } catch (error) {
        console.error('Failed to generate ticket image', error)
        alert('Could not generate ticket. Please try again.')
    }
  }

  const downloadAllTickets = async () => {
    setIsBulkDownloading(true)
    
    for (let i = 0; i < tickets.length; i++) {
      const ticket = tickets[i]
      const node = document.getElementById(`ticket-element-${ticket.id}`)
      if (!node) continue

      try {
        const dataUrl = await toPng(node, { cacheBust: true })
        const fileName = `ticket-${ticket.name.replace(/\s+/g, '-')}-${ticket.short_code}.png`
        download(dataUrl, fileName)
        
        // Add delay between downloads to prevent browser blocking
        if (i < tickets.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 300))
        }
      } catch (error) {
        console.error(`Failed to generate ticket for ${ticket.name}`, error)
      }
    }
    
    setIsBulkDownloading(false)
  }

  const renderStep = () => {
    switch (step) {
      case 'quantity':
        return (
          <Card className="w-full max-w-md bg-zinc-900 border-zinc-800 text-white">
            <CardHeader>
              <CardTitle className="text-2xl text-yellow-500">Select Tickets</CardTitle>
              <CardDescription className="text-gray-400">How many people are coming?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Quantity</Label>
                <Input 
                  type="number" 
                  min="1" 
                  max="10"
                  value={quantity} 
                  onChange={handleQuantityChange}
                  className="bg-black border-zinc-700 text-white text-lg"
                />
                <p className="text-sm text-gray-400 text-right">Total: <span className="text-yellow-500 font-bold">GHS {quantity * 50}.00</span></p>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={goToDetails} className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold">
                Next: Attendee Details
              </Button>
            </CardFooter>
          </Card>
        )

      case 'details':
        return (
           <Card className="w-full max-w-md bg-zinc-900 border-zinc-800 text-white">
            <CardHeader>
              <CardTitle className="text-2xl text-yellow-500">Attendee Names</CardTitle>
              <CardDescription className="text-gray-400">Who is this ticket for?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 max-h-[60vh] overflow-y-auto">
              {names.map((name, idx) => (
                <div key={idx} className="space-y-2">
                  <Label>Attendee #{idx + 1}</Label>
                  <Input 
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => handleNameChange(idx, e.target.value)}
                    className="bg-black border-zinc-700 text-white"
                  />
                </div>
              ))}
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button variant="outline" onClick={() => setStep('quantity')} className="border-zinc-700 text-gray-300">Back</Button>
              <Button onClick={goToPayment} className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black font-bold">
                Next: Payment
              </Button>
            </CardFooter>
          </Card>
        )

      case 'payment':
        return (
          <Card className="w-full max-w-md bg-zinc-900 border-zinc-800 text-white">
            <CardHeader>
              <CardTitle className="text-2xl text-yellow-500">Payment</CardTitle>
              <CardDescription className="text-gray-400">Enter your Mobile Money number</CardDescription>
            </CardHeader>
             <CardContent className="space-y-4">
              <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-300">Total Amount</span>
                      <span className="text-xl font-bold text-yellow-500">GHS {quantity * 50}.00</span>
                  </div>
                   <div className="text-xs text-gray-500">You will receive a prompt to authorize payment.</div>
              </div>

              <div className="space-y-2">
                <Label>Email Address</Label>
                <div className="relative">
                    <Input 
                        type="email" 
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-black border-zinc-700 text-white"
                    />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Mobile Money Network</Label>
                <select 
                    className="w-full bg-black border border-zinc-700 text-white p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    value={network}
                    onChange={(e) => setNetwork(e.target.value)}
                >
                    <option value="MTN">MTN Mobile Money</option>
                    <option value="VODA">Telecel Cash (Vodafone)</option>
                    <option value="AT">AT Money (AirtelTigo)</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label>Mobile Number</Label>
                <div className="relative">
                    <Smartphone className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                    <Input 
                    type="tel" 
                    placeholder="024 123 4567"
                    value={phoneNumber}
                    onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '')
                        if (val.length <= 10) setPhoneNumber(val)
                    }}
                    className="pl-9 bg-black border-zinc-700 text-white"
                    />
                </div>
                <p className="text-xs text-gray-500">
                    {network === 'MTN' && 'Starts with 024, 054, 055, 059...'}
                    {network === 'VODA' && 'Starts with 020, 050...'}
                    {network === 'AT' && 'Starts with 027, 057, 026...'}
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button variant="outline" onClick={() => setStep('details')} className="border-zinc-700 text-gray-300">Back</Button>
              <Button onClick={handlePayment} disabled={isProcessing} className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold">
                {isProcessing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</> : 'Pay Now'}
              </Button>
            </CardFooter>
          </Card>
        )

      case 'success':
        return (
          <div className="w-full max-w-4xl animate-in fade-in-50 duration-500">
             <div className="text-center mb-8">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-white mb-2">Payment Successful!</h2>
                <p className="text-gray-400">Here are your tickets. See you at Waakye Fest!</p>
             </div>
             
             {tickets.length > 1 && (
               <div className="mb-6 flex justify-center">
                 <Button 
                   onClick={downloadAllTickets} 
                   disabled={isBulkDownloading}
                   className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-8 py-3"
                 >
                   {isBulkDownloading ? (
                     <>
                       <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                       Downloading {tickets.length} tickets...
                     </>
                   ) : (
                     <>
                       <Download className="mr-2 h-4 w-4" />
                       Download All Tickets ({tickets.length})
                     </>
                   )}
                 </Button>
               </div>
             )}
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 justify-items-center">
                {tickets.map((ticket) => (
                    <div key={ticket.id} className="flex flex-col gap-4">
                        <div id={`ticket-element-${ticket.id}`}>
                            <TicketView 
                                name={ticket.name}
                                ticketId={ticket.id}
                                shortCode={ticket.short_code}
                                type={ticket.type}
                                eventDetails={eventSettings}
                            />
                        </div>
                        <Button onClick={() => downloadTicket(ticket.id)} className="w-full bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700">
                            <Download className="mr-2 h-4 w-4" /> Download Ticket
                        </Button>
                    </div>
                ))}
            </div>
             
             <div className="mt-12 text-center">
                 <Button variant="link" onClick={() => {
                     setStep('quantity')
                     setQuantity(1)
                     setNames([''])
                     setPhoneNumber('')
                     setTickets([])
                 }} className="text-yellow-500 hover:text-yellow-400">Buy More Tickets</Button>
             </div>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 pt-24">
      <Header />
      {renderStep()}
    </div>
  )
}
