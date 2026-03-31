import Link from 'next/link'
import { Building2, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ApplicationForm } from '@/components/application-form'
import { Toaster } from '@/components/ui/sonner'

export const metadata = {
  title: 'Apply for Hostel - IIT Ropar',
  description: 'Submit your hostel allocation application',
}

export default function ApplyPage() {
  return (
    <div className="min-h-screen bg-muted/30">
      <Toaster />
      
      {/* Header */}
      <header className="border-b bg-background sticky top-0 z-50">
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
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold tracking-tight">
              Hostel Allocation Application
            </h2>
            <p className="text-muted-foreground mt-2">
              Please fill in all the required information to apply for hostel
              accommodation at IIT Ropar.
            </p>
          </div>

          <ApplicationForm />
        </div>
      </main>
    </div>
  )
}
