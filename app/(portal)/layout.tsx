// app/(portal)/layout.tsx
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AppShell } from '@/components/layout/AppShell'
import { useAuth } from '@/hooks/useAuth'
import { SocketProvider } from '@/components/providers/SocketProvider'
import { cn } from '@/lib/utils'

// ===== SCROLLBAR STYLES =====
const scrollbarStyles = `
  [&::-webkit-scrollbar]:w-1.5
  [&::-webkit-scrollbar]:h-1.5
  [&::-webkit-scrollbar-track]:bg-muted/20
  [&::-webkit-scrollbar-track]:rounded-full
  [&::-webkit-scrollbar-thumb]:bg-muted-foreground/25
  [&::-webkit-scrollbar-thumb]:rounded-full
  [&::-webkit-scrollbar-thumb]:hover:bg-muted-foreground/40
  dark:[&::-webkit-scrollbar-track]:bg-muted/15
  dark:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/30
  dark:[&::-webkit-scrollbar-thumb]:hover:bg-muted-foreground/50
  scrollbar-width:thin
  scrollbar-color:hsl(var(--muted-foreground)/0.25) transparent
`

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

  // Deshabilitar Ctrl+B (opcional)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault()
      }
    }
    
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

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
      <AppShell>
        {/* ===== CONTENIDO CON SCROLL PERSONALIZADO ===== */}
        <div className={cn(
          "h-full w-full overflow-y-auto",
          scrollbarStyles
        )}>
          {children}
        </div>
      </AppShell>
    </SocketProvider>
  )
}