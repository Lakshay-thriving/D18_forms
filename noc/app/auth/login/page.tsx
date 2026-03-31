'use client'

import { useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'

export default function LoginPage() {
  const [step, setStep] = useState<'email' | 'otp'>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [userType, setUserType] = useState<'ADMIN' | 'APPLICANT'>('ADMIN')

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      toast.error('Please enter your email')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/auth/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, userType }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || 'Failed to send OTP')
        return
      }

      // In dev mode, show the OTP
      if (data.devOTP) {
        toast.info(`Dev OTP: ${data.devOTP}`)
      }

      toast.success('OTP sent to your email')
      setStep('otp')
    } catch (error) {
      console.error('Error requesting OTP:', error)
      toast.error('Failed to request OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!otp || otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, userType }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || 'Invalid OTP')
        return
      }

      toast.success('Login successful')
      // Redirect based on role - use window.location for full page load to ensure auth state is fresh
      window.location.href = data.redirectUrl
    } catch (error) {
      console.error('Error verifying OTP:', error)
      toast.error('Failed to verify OTP')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md px-4">
        <div className="border border-black/10 dark:border-white/10 rounded-2xl p-8 bg-card">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold mb-2">NOC Management System</h1>
            <p className="text-secondary text-sm font-medium">IIT Ropar</p>
          </div>

          {/* User Type Selection */}
          {step === 'email' && (
            <div className="mb-6">
              <label className="text-sm font-medium mb-3 block">Login as:</label>
              <div className="flex gap-3">
                <button
                  onClick={() => setUserType('ADMIN')}
                  className={`flex-1 py-2 px-3 rounded-lg border transition-all ${
                    userType === 'ADMIN'
                      ? 'border-foreground bg-foreground text-background'
                      : 'border-black/10 dark:border-white/10 bg-transparent'
                  }`}
                >
                  Admin / Workflow
                </button>
                <button
                  onClick={() => setUserType('APPLICANT')}
                  className={`flex-1 py-2 px-3 rounded-lg border transition-all ${
                    userType === 'APPLICANT'
                      ? 'border-foreground bg-foreground text-background'
                      : 'border-black/10 dark:border-white/10 bg-transparent'
                  }`}
                >
                  Applicant
                </button>
              </div>
            </div>
          )}

          {/* Email Step */}
          {step === 'email' && (
            <form onSubmit={handleRequestOTP} className="space-y-4">
              <div>
                <label htmlFor="email" className="text-sm font-medium mb-2 block">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder={
                    userType === 'APPLICANT'
                      ? 'your.name@iitrpr.ac.in'
                      : 'your.email@example.com'
                  }
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-background border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-foreground placeholder:text-secondary focus:outline-none focus:ring-1 focus:ring-foreground"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 px-4 rounded-full bg-foreground text-background font-medium hover:opacity-90 disabled:opacity-50 transition-all"
              >
                {loading ? 'Sending...' : 'Send OTP'}
              </button>

              {userType === 'APPLICANT' && (
                <p className="text-xs text-secondary text-center font-medium">
                  Only @iitrpr.ac.in email addresses are accepted
                </p>
              )}
            </form>
          )}

          {/* OTP Step */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div>
                <label htmlFor="otp" className="text-sm font-medium mb-2 block">
                  Enter OTP
                </label>
                <p className="text-xs text-secondary mb-3 font-medium">
                  We sent a 6-digit code to <span className="font-mono">{email}</span>
                </p>
                <input
                  id="otp"
                  type="text"
                  placeholder="000000"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full bg-background border border-black/10 dark:border-white/10 rounded-lg px-3 py-3 text-center font-mono text-lg tracking-widest text-foreground placeholder:text-secondary focus:outline-none focus:ring-1 focus:ring-foreground"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 px-4 rounded-full bg-foreground text-background font-medium hover:opacity-90 disabled:opacity-50 transition-all"
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep('email')
                  setOtp('')
                }}
                className="w-full py-2 px-4 rounded-full border border-black/10 dark:border-white/10 bg-transparent text-foreground hover:bg-black/2 dark:hover:bg-white/2 transition-all"
              >
                Back to Email
              </button>
            </form>
          )}

          {/* Footer */}
          <div className="mt-6 text-center text-xs text-secondary font-medium">
            <p>IIT Ropar Digital Services</p>
          </div>
        </div>
      </div>
    </div>
  )
}
