import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Button } from '../components/ui/button'
import { Eye, EyeOff } from 'lucide-react'

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8001'

// Reusing the hero image from the landing page
const HeroImage = "/wakye_fest_hero_bg.png";

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

export function LoginPage() {
    const navigate = useNavigate()
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const res = await fetch(`${apiUrl}/api/token/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            })

            const data = await res.json()

            if (res.ok) {
                localStorage.setItem('access_token', data.access)
                localStorage.setItem('refresh_token', data.refresh)
                navigate({ to: '/dashboard' })
            } else {
                setError(data.detail || 'Login failed')
            }
        } catch (err) {
            setError('Network error. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black font-outfit">
             {/* Background Image with Overlay */}
            <div 
                className="absolute inset-0 z-0"
                style={{
                backgroundImage: `url(${HeroImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                filter: 'brightness(0.3) blur(4px)'
                }}
            />
            <div className="absolute inset-0 z-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

            <Card className="relative z-10 w-full max-w-md bg-black/40 backdrop-blur-xl border-yellow-500/30 text-white shadow-[0_0_40px_rgba(0,0,0,0.5)]">
                <CardHeader className="space-y-1 text-center border-b border-white/10 pb-6">
                    <CardTitle className="text-3xl font-extrabold tracking-tight">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                            WAAKYE FEST
                        </span>
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                        Organizer Dashboard Access
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleLogin}>
                    <CardContent className="space-y-4 pt-6">
                        {error && (
                            <div className="p-3 text-sm text-red-200 bg-red-900/30 border border-red-500/30 rounded-md">
                                {error}
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="username" className="text-gray-300">Username</Label>
                            <Input 
                                id="username" 
                                type="text" 
                                placeholder="Admin user"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required 
                                className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-yellow-500/50 focus:ring-yellow-500/20"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-gray-300">Password</Label>
                            <div className="relative">
                                <Input 
                                    id="password" 
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required 
                                    className="bg-white/5 border-white/10 text-white focus:border-yellow-500/50 focus:ring-yellow-500/20 pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="pb-6">
                        <Button 
                            type="submit" 
                            className="w-full mt-4 bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white border-0 font-bold py-5 shadow-lg shadow-orange-900/20 transition-all hover:scale-[1.02]" 
                            disabled={loading}
                        >
                            {loading ? 'Authenticating...' : 'Login'}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
