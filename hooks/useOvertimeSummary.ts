'use client'

import { useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/axios'
import { toast } from 'sonner'
import type { OvertimeSummary } from '@/types/overtime.types'

function getErrorMessage(err: unknown, fallback: string) {
  if (typeof err === 'object' && err !== null) {
    const maybeErr = err as { response?: { data?: { message?: unknown } }; message?: unknown }
    const responseMessage = maybeErr.response?.data?.message
    if (typeof responseMessage === 'string' && responseMessage.trim().length > 0) {
      return responseMessage
    }
    if (typeof maybeErr.message === 'string' && maybeErr.message.trim().length > 0) {
      return maybeErr.message
    }
  }
  return fallback
}

export function useOvertimeSummary(year: number, month: number) {
  const [summary, setSummary] = useState<OvertimeSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const res = await api.get<OvertimeSummary>('/overtime/summary', {
        params: { year, month },
        skip401Redirect: true,
      })
      setSummary(res.data)
    } catch (err) {
      const msg = getErrorMessage(err, 'Error al cargar el resumen de horas extra')
      setError(msg)
      toast.error(msg)
    } finally {
      setIsLoading(false)
    }
  }, [year, month])

  useEffect(() => {
    load()
  }, [load])

  return { summary, isLoading, error, reload: load }
}
