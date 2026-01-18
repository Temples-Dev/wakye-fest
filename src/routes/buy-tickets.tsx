
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { TicketView } from '@/components/TicketView'
import { Loader2, Download, CheckCircle, Smartphone } from 'lucide-react'

export const Route = createFileRoute('/buy-tickets')({
  component: BuyTickets,
})

type Step = 'quantity' | 'details' | 'payment' | 'success'

interface TicketData {
  id: string
  name: string
  type: 'General Admission'
}

function BuyTickets() {
  const [step, setStep] = useState<Step>('quantity')
  const [quantity, setQuantity] = useState(1)
  const [names, setNames] = useState<string[]>([''])
  const [phoneNumber, setPhoneNumber] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [tickets, setTickets] = useState<TicketData[]>([])

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value)
    if (val > 0 && val <= 10) {
      setQuantity(val)
      // Resize names array
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
    setStep('payment')
  }

  const handlePayment = async () => {
    if (phoneNumber.length < 10) {
       alert('Please enter a valid mobile number')
       return
    }
    
    setIsProcessing(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Generate Tickets
    const newTickets = names.map(name => ({
      id: Math.random().toString(36).substr(2, 9).toUpperCase(),
      name,
      type: 'General Admission' as const
    }))
    setTickets(newTickets)
    setIsProcessing(false)
    setStep('success')
  }

  const downloadTicket = (id: string) => {
    // Mock download
    alert(`Downloading ticket ${id}... (Implementation would use html-to-image here)`)
    
    // In a real app we might window.print()
    // window.print()
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
                <Label>Mobile Number</Label>
                <div className="relative">
                    <Smartphone className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                    <Input 
                    type="tel" 
                    placeholder="024 123 4567"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="pl-9 bg-black border-zinc-700 text-white"
                    />
                </div>
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
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 justify-items-center">
                {tickets.map((ticket) => (
                    <div key={ticket.id} className="flex flex-col gap-4">
                        <TicketView 
                            name={ticket.name}
                            ticketId={ticket.id}
                            type={ticket.type}
                        />
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
      {renderStep()}
    </div>
  )
}
