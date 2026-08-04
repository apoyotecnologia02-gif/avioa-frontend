'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AppShell } from '@/components/layout/AppShell'
import { useAuth } from '@/hooks/useAuth'
import { SocketProvider } from '@/components/providers/SocketProvider'
import { SidebarProvider } from "@/components/ui/sidebar"
import { ThemeProvider } from '@/components/providers/ThemeProvider'

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated, isLoading, token, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, isLoading, router])

  // Monitor token expiration actively
  useEffect(() => {
    if (!isAuthenticated || !token) return

    const checkTokenExpiration = () => {
      try {
        const payloadSegment = token.split('.')[1]
        if (!payloadSegment) return
        const base64 = payloadSegment.replace(/-/g, '+').replace(/_/g, '/')
        const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=')
        const decoded = JSON.parse(window.atob(padded)) as { exp?: number }
        
        if (decoded.exp && decoded.exp * 1000 < Date.now()) {
          logout()
        }
      } catch {
        logout()
      }
    }

    // Check immediately
    checkTokenExpiration()

    // Check every 5 seconds
    const interval = setInterval(checkTokenExpiration, 5000)

    // Check on window focus and visibility change
    const handleFocus = () => checkTokenExpiration()
    
    window.addEventListener('focus', handleFocus)
    window.addEventListener('visibilitychange', checkTokenExpiration)

    return () => {
      clearInterval(interval)
      window.removeEventListener('focus', handleFocus)
      window.removeEventListener('visibilitychange', checkTokenExpiration)
    }
  }, [isAuthenticated, token, logout])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <SocketProvider>
      <SidebarProvider defaultOpen={false}>
        <AppShell><ThemeProvider>{children}</ThemeProvider></AppShell>
      </SidebarProvider>
    </SocketProvider>
  )
}