
import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent } from '@/components/ui/card'
import { Mail, Phone, Instagram } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export const Route = createFileRoute('/contact')({
  component: Contact,
})

function Contact() {
  return (
    <div className="min-h-screen bg-black pt-24 px-4 pb-12">
      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
            CONTACT US
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Have questions? Want to be a vendor? Get in touch!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Contact Info */}
            <div className="space-y-6">
                <Card className="bg-zinc-900 border-zinc-800 text-white">
                    <CardContent className="pt-6 space-y-6">
                        <div className="flex items-center gap-4">
                            <Mail className="w-6 h-6 text-yellow-500" />
                            <div>
                                <h3 className="font-bold">Email</h3>
                                <p className="text-gray-400">hello@wakyefest.com</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <Phone className="w-6 h-6 text-yellow-500" />
                             <div>
                                <h3 className="font-bold">Phone</h3>
                                <p className="text-gray-400">+233 24 000 0000</p>
                            </div>
                        </div>
                         <div className="flex items-center gap-4">
                            <Instagram className="w-6 h-6 text-yellow-500" />
                             <div>
                                <h3 className="font-bold">Social</h3>
                                <p className="text-gray-400">@wakyefest</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                
                <div className="p-6 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl text-black">
                    <h3 className="text-2xl font-black mb-2">BECOME A VENDOR</h3>
                    <p className="mb-4 font-medium">Showcase your Waakye to thousands of food lovers.</p>
                    <Button variant="outline" className="w-full bg-black text-white border-0 hover:bg-zinc-800">
                        Apply Now
                    </Button>
                </div>
            </div>

            {/* Message Form */}
            <Card className="bg-zinc-900 border-zinc-800 text-white">
                <CardContent className="pt-6 space-y-4">
                    <div className="space-y-2">
                        <Label>Name</Label>
                        <Input placeholder="Your name" className="bg-black border-zinc-700" />
                    </div>
                     <div className="space-y-2">
                        <Label>Email</Label>
                        <Input placeholder="Your email" className="bg-black border-zinc-700" />
                    </div>
                     <div className="space-y-2">
                        <Label>Message</Label>
                        <textarea 
                            className="w-full h-32 rounded-md border border-zinc-700 bg-black px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="How can we help?"
                        />
                    </div>
                    <Button className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold">
                        Send Message
                    </Button>
                </CardContent>
            </Card>
        </div>

      </div>
    </div>
  )
}
