import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  CalendarDays, 
  ClipboardCheck, 
  Clock, 
  FileText, 
  Shield, 
  Users,
  ArrowRight,
  CheckCircle
} from 'lucide-react'

export default async function HomePage() {
  const user = await getCurrentUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <span className="text-sm font-bold">IIT</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">IIT Ropar</h1>
              <p className="text-xs text-muted-foreground">Mess Rebate System</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Login</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/register">Register</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-background py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Mess Rebate Request System
            </h1>
            <p className="mt-6 text-pretty text-lg text-muted-foreground">
              A streamlined digital platform for IIT Ropar students to submit and track
              mess rebate requests with a multi-level approval workflow.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button size="lg" asChild>
                <Link href="/register">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/login">Student Login</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-foreground">How It Works</h2>
            <p className="mt-2 text-muted-foreground">
              Simple steps to submit and track your rebate request
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <Card>
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>1. Submit Request</CardTitle>
                <CardDescription>
                  Fill in your details, select dates, and submit your rebate request
                  with required documents for official leave.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <ClipboardCheck className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>2. Multi-Level Review</CardTitle>
                <CardDescription>
                  Your request goes through Mess Manager, Caretaker, and Junior
                  Superintendent for verification and approval.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <CheckCircle className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>3. Get Approved</CardTitle>
                <CardDescription>
                  Track your request status in real-time and receive notifications
                  upon approval or if action is required.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Rules Section */}
      <section className="bg-secondary/30 py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-foreground">Rebate Rules</h2>
            <p className="mt-2 text-muted-foreground">
              Important guidelines for mess rebate requests
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-accent">
                  <CheckCircle className="h-5 w-5" />
                  Allowed Conditions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CalendarDays className="mt-0.5 h-5 w-5 text-muted-foreground" />
                    <span>Minimum 3 days at a stretch</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Clock className="mt-0.5 h-5 w-5 text-muted-foreground" />
                    <span>Maximum 20 days per semester</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Shield className="mt-0.5 h-5 w-5 text-muted-foreground" />
                    <span>Must apply at least 1 day in advance</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <Shield className="h-5 w-5" />
                  Auto-Rejection Conditions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="mt-0.5 h-5 w-5 text-center text-muted-foreground">-</span>
                    <span>Less than 3 consecutive days</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-0.5 h-5 w-5 text-center text-muted-foreground">-</span>
                    <span>Exceeds 20 days without override</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-0.5 h-5 w-5 text-center text-muted-foreground">-</span>
                    <span>Backdated requests</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-0.5 h-5 w-5 text-center text-muted-foreground">-</span>
                    <span>Missing documents for duty leave</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-foreground">Approval Workflow</h2>
            <p className="mt-2 text-muted-foreground">
              Multi-level verification ensures accurate rebate processing
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-4">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold">Student</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Submits request with details and documents
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <ClipboardCheck className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold">Mess Manager</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Verifies dates and confirms meal count
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold">Caretaker</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Checks hostel and student records
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
                <CheckCircle className="h-8 w-8 text-accent" />
              </div>
              <h3 className="font-semibold">Jr. Superintendent</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Final review and approval
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary py-16">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <h2 className="text-3xl font-bold text-primary-foreground">
            Ready to Submit Your Request?
          </h2>
          <p className="mt-2 text-primary-foreground/80">
            Register now and start managing your mess rebates digitally
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/register">Create Account</Link>
            </Button>
            <Button size="lg" variant="outline" className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card py-8">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-primary text-primary-foreground">
                <span className="text-xs font-bold">IIT</span>
              </div>
              <span className="text-sm text-muted-foreground">
                Indian Institute of Technology Ropar
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Mess Rebate System | Student Affairs Section
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
