import { redirect } from 'next/navigation'
import { getCurrentUser, getRoleDashboardPath } from '@/lib/auth'

export default async function DashboardPage() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/login')
  }
  
  // Redirect to role-specific dashboard
  const dashboardPath = getRoleDashboardPath(user.role)
  redirect(dashboardPath)
}
