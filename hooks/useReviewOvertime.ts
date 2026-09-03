'use client'

import { useState } from 'react'
import { api } from '@/lib/axios'
import { toast } from 'sonner'
import type { ReviewOvertimeDto } from '@/types/overtime.types'

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

export function useReviewOvertime(onSuccess?: () => void) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const reviewOvertime = async (id: string, dto: ReviewOvertimeDto) => {
    try {
      if (!id || id === 'undefined') {
        throw new Error('No se pudo identificar la solicitud a revisar')
      }
      setIsSubmitting(true)
      await api.patch(`/overtime/${id}/review`, dto)
      const label = dto.status === 'APPROVED' ? 'aprobada' : 'rechazada'
      toast.success(`Solicitud ${label} correctamente`)
      onSuccess?.()
    } catch (err) {
      const msg = getErrorMessage(err, 'Error al procesar la solicitud')
      toast.error(msg)
      throw new Error(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  return { isSubmitting, reviewOvertime }
}
