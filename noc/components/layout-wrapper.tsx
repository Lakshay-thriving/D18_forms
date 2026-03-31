'use client'

import { useTheme } from 'next-themes'
import { Moon, Sun, LogOut, Menu, X } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import Link from 'next/link'
import { useState, useEffect } from 'react'

interface LayoutWrapperProps {
  children: React.ReactNode
  showNavigation?: boolean
}

export function LayoutWrapper({ children, showNavigation = true }: LayoutWrapperProps) {
  const { theme, setTheme } = useTheme()
  const { user, logout, loading } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch by only rendering auth-dependent UI after mount
  useEffect(() => {
    setMounted(true)
  }, [])

  // Show loading while auth is being determined
  if (!mounted || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-foreground border-t-background rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-secondary font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {showNavigation && (
        <nav className="no-print border-b border-black/10 dark:border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo/Brand */}
              <div className="flex-shrink-0">
                <Link href="/" className="font-semibold text-lg">
                  NOC System
                </Link>
              </div>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center gap-6">
                {user ? (
                  <>
                    <span className="text-sm text-secondary font-medium">{user.email}</span>
                    <span className="text-xs font-mono bg-black/5 dark:bg-white/5 px-2 py-1 rounded text-secondary font-medium">
                      {user.role}
                    </span>
                    {/* Theme Toggle */}
                    <button
                      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                      className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors"
                      aria-label="Toggle theme"
                    >
                      {theme === 'dark' ? (
                        <Sun className="w-4 h-4" />
                      ) : (
                        <Moon className="w-4 h-4" />
                      )}
                    </button>
                    {/* Logout */}
                    <button
                      onClick={logout}
                      className="flex items-center gap-2 px-3 py-2 border border-black/10 dark:border-white/10 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-sm"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    {/* Theme Toggle for non-logged in users */}
                    <button
                      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                      className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors"
                      aria-label="Toggle theme"
                    >
                      {theme === 'dark' ? (
                        <Sun className="w-4 h-4" />
                      ) : (
                        <Moon className="w-4 h-4" />
                      )}
                    </button>
                  </>
                )}
              </div>

              {/* Mobile Menu Button */}
              <div className="md:hidden flex items-center gap-4">
                <button
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors"
                >
                  {theme === 'dark' ? (
                    <Sun className="w-4 h-4" />
                  ) : (
                    <Moon className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors"
                >
                  {mobileMenuOpen ? (
                    <X className="w-5 h-5" />
                  ) : (
                    <Menu className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
              <div className="md:hidden border-t border-black/10 dark:border-white/10 py-4 space-y-3">
                {user && (
                  <>
                    <div className="px-4 py-2 text-sm">
                      <p className="text-secondary font-medium">{user.email}</p>
                      <p className="text-xs font-mono mt-1 text-secondary font-medium">{user.role}</p>
                    </div>
                    <button
                      onClick={() => {
                        logout()
                        setMobileMenuOpen(false)
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-black/5 dark:hover:bg-white/5 rounded transition-colors text-sm flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </nav>
      )}

      {/* Main Content */}
      <main>{children}</main>
    </div>
  )
}
