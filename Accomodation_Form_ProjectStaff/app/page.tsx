import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, ClipboardList, Users, Shield } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-muted/30">
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
            <nav className="flex items-center gap-4">
              <Link href="/track">
                <Button variant="outline">Track Application</Button>
              </Link>
              <Link href="/apply">
                <Button>Apply Now</Button>
              </Link>
              <Link href="/auth">
                <Button variant="secondary">Sign In</Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold tracking-tight mb-4">
            Hostel Allocation Management System
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Streamlined process for hostel room allocation for Project Staff,
            JRF, SRF, RA, Post Docs, Visiting Scholars, and other guests at IIT
            Ropar.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/apply">
              <Button size="lg">
                <ClipboardList className="mr-2 h-5 w-5" />
                Submit Application
              </Button>
            </Link>
            <Link href="/track">
              <Button size="lg" variant="outline">
                Track Your Application
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features - REMOVED */}

      {/* Stakeholder Access */}
      <section className="container mx-auto px-4 py-12">
        <h3 className="text-2xl font-bold text-center mb-8">
          Stakeholder Access
        </h3>
        <div className="max-w-md mx-auto">
          <Card className="text-center">
            <CardHeader>
              <CardTitle>Stakeholder Login</CardTitle>
              <CardDescription>
                Faculty Supervisors, HODs, Junior Superintendent, Assistant Registrar, and Chief Warden can login to review and approve applications.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/auth">
                <Button size="lg" className="w-full">
                  <Shield className="mr-2 h-5 w-5" />
                  Login to Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-background mt-12">
        <div className="container mx-auto px-4 py-6">
          <p className="text-center text-sm text-muted-foreground">
            Indian Institute of Technology Ropar - Hostel Allocation System
          </p>
        </div>
      </footer>
    </div>
  )
}
