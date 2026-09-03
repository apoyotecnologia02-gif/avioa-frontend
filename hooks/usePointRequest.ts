'use client'

import { useState, useCallback, useEffect } from 'react'
import { api } from '@/lib/axios'
import { PendingPointRequest } from './usePendingRequests'

export function usePointRequest(pointRequestId: string) {
  const [request, setRequest] = useState<PendingPointRequest | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRequest = useCallback(async () => {
    if (!pointRequestId) return;
    setIsLoading(true)
    setError(null)
    try {
      const response = await api.get(`/points/pending/${pointRequestId}`)
      const data = response.data?.data || response.data
      setRequest(data)
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Error al obtener la solicitud')
    } finally {
      setIsLoading(false)
    }
  }, [pointRequestId])

  useEffect(() => {
    fetchRequest()
  }, [fetchRequest])

  return { request, isLoading, error, reload: fetchRequest }
}
