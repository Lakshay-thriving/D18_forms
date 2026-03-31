'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Building2, ArrowLeft, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { Toaster } from '@/components/ui/sonner'
import { toast } from 'sonner'

export default function TrackPage() {
  const [applicationId, setApplicationId] = useState('')
  const [email, setEmail] = useState('')
  const [isSearching, setIsSearching] = useState(false)

  const handleSearch = async () => {
    if (!applicationId && !email) {
      toast.error('Please enter an application ID or email address')
      return
    }

    setIsSearching(true)
    try {
      const params = new URLSearchParams()
      if (applicationId) params.append('id', applicationId)
      if (email) params.append('email', email)

      const response = await fetch(`/api/applications/search?${params}`)
      const data = await response.json()

      if (data.applications && data.applications.length > 0) {
        if (data.applications.length === 1) {
          window.location.href = `/application/${data.applications[0].id}`
        } else {
          // Multiple applications found, show list
          window.location.href = `/track/results?${params}`
        }
      } else {
        toast.error('No applications found with the provided details')
      }
    } catch (error) {
      console.error('Error searching:', error)
      toast.error('Failed to search. Please try again.')
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <Toaster />
      
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

      {/* Main Content */}
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Track Your Application</CardTitle>
              <CardDescription>
                Enter your application ID or email address to check the status
                of your hostel allocation request.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Application ID
                </label>
                <Input
                  placeholder="Enter your application ID"
                  value={applicationId}
                  onChange={(e) => setApplicationId(e.target.value)}
                />
              </div>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">
                    Or
                  </span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Email Address
                </label>
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <Button
                className="w-full"
                onClick={handleSearch}
                disabled={isSearching}
              >
                {isSearching ? (
                  <Spinner className="mr-2" />
                ) : (
                  <Search className="mr-2 h-4 w-4" />
                )}
                Search Application
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
