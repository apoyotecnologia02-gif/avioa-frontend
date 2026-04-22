'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'

export function useAuth() {
  const router = useRouter()
  const { user, token, isAuthenticated, isLoading, login, logout, hydrate } = useAuthStore()

  useEffect(() => {
    hydrate()
  }, [hydrate])

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    logout: handleLogout,
  }
}
