'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Building2, Mail, KeyRound, Loader2, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

type LoginStep = 'email' | 'otp'

export default function AuthPage() {
  const router = useRouter()
  const [loginStep, setLoginStep] = useState<LoginStep>('email')
  const [loginEmail, setLoginEmail] = useState('')
  const [loginOtp, setLoginOtp] = useState('')
  const [demoLoginOtp, setDemoLoginOtp] = useState<string | null>(null)
  const [loginError, setLoginError] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)

  const handleLoginSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError('')
    setLoginLoading(true)

    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail }),
      })

      const data = await response.json()

      if (!response.ok) {
        setLoginError(data.error || 'Failed to send OTP')
        return
      }

      if (data.demoOtp) {
        setDemoLoginOtp(data.demoOtp)
      }

      setLoginStep('otp')
    } catch {
      setLoginError('Network error. Please try again.')
    } finally {
      setLoginLoading(false)
    }
  }

  const handleLoginVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError('')
    setLoginLoading(true)

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, otp: loginOtp }),
      })

      const data = await response.json()

      if (!response.ok) {
        setLoginError(data.error || 'Failed to verify OTP')
        return
      }

      router.push(data.redirectPath)
      router.refresh()
    } catch {
      setLoginError('Network error. Please try again.')
    } finally {
      setLoginLoading(false)
    }
  }

  const handleLoginResendOTP = async () => {
    setLoginError('')
    setLoginLoading(true)

    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail }),
      })

      const data = await response.json()

      if (!response.ok) {
        setLoginError(data.error || 'Failed to resend OTP')
        return
      }

      if (data.demoOtp) {
        setDemoLoginOtp(data.demoOtp)
      }
    } catch {
      setLoginError('Network error. Please try again.')
    } finally {
      setLoginLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      {/* Header */}
      <header className="border-b bg-background">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Building2 className="h-8 w-8 text-primary" />
              <div>
                <h1 className="font-bold text-lg">IIT Ropar</h1>
                <p className="text-xs text-muted-foreground">
                  Hostel Allocation System
                </p>
              </div>
            </div>
            <Link href="/">
              <Button variant="ghost">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Auth Form */}
      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Stakeholder Login</CardTitle>
            <CardDescription>
              Enter your email to access the approval dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loginError && (
              <Alert variant="destructive">
                <AlertDescription>{loginError}</AlertDescription>
              </Alert>
            )}

            {loginStep === 'email' ? (
              <form onSubmit={handleLoginSendOTP} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="login-email" className="text-sm font-medium">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="your.email@iitrpr.ac.in"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Enter your registered stakeholder email address
                  </p>
                </div>
                <Button type="submit" className="w-full" disabled={loginLoading}>
                  {loginLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending OTP...
                    </>
                  ) : (
                    'Send OTP'
                  )}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleLoginVerifyOTP} className="space-y-4">
                {demoLoginOtp && (
                  <Alert className="bg-amber-50 border-amber-200">
                    <AlertDescription className="text-amber-800">
                      <strong>Demo Mode:</strong> Your OTP is <code className="font-mono bg-amber-100 px-1 rounded">{demoLoginOtp}</code>
                    </AlertDescription>
                  </Alert>
                )}
                
                <div className="space-y-2">
                  <label htmlFor="login-otp" className="text-sm font-medium">
                    One-Time Password
                  </label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="login-otp"
                      type="text"
                      placeholder="Enter 6-digit OTP"
                      value={loginOtp}
                      onChange={(e) => setLoginOtp(e.target.value)}
                      className="pl-10 font-mono tracking-widest"
                      maxLength={6}
                      pattern="[0-9]{6}"
                      required
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    OTP sent to {loginEmail}
                  </p>
                </div>
                
                <Button type="submit" className="w-full" disabled={loginLoading}>
                  {loginLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Verify & Login'
                  )}
                </Button>

                <div className="flex items-center justify-between text-sm">
                  <button
                    type="button"
                    onClick={() => {
                      setLoginStep('email')
                      setLoginOtp('')
                      setDemoLoginOtp(null)
                    }}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Change email
                  </button>
                  <button
                    type="button"
                    onClick={handleLoginResendOTP}
                    className="text-primary hover:underline"
                    disabled={loginLoading}
                  >
                    Resend OTP
                  </button>
                </div>
              </form>
            )}

            <div className="pt-4 text-center text-sm text-muted-foreground border-t">
              <p>Stakeholders: Faculty, HOD, Junior Superintendent, Assistant Registrar, and Chief Warden login here.</p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
