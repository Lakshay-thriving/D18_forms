import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Building2, Home, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Toaster } from '@/components/ui/sonner'
import { getCurrentUser, getRoleDisplayName, getRoleDashboardPath } from '@/lib/auth'
import { LogoutButton } from '@/components/logout-button'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/login')
  }

  const roleName = getRoleDisplayName(user.role)
  const dashboardPath = getRoleDashboardPath(user.role)

  return (
    <div className="min-h-screen bg-muted/30">
      <Toaster />
      
      {/* Header */}
      <header className="border-b bg-background sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href={dashboardPath} className="flex items-center gap-3">
              <Building2 className="h-8 w-8 text-primary" />
              <div>
                <h1 className="font-bold text-lg">IIT Ropar</h1>
                <p className="text-xs text-muted-foreground">
                  Hostel Allocation System
                </p>
              </div>
            </Link>
            
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground">{roleName}</p>
              </div>
              
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <Home className="h-4 w-4" />
                  <span className="hidden sm:inline ml-2">Home</span>
                </Button>
              </Link>
              
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      {children}
    </div>
  )
}
