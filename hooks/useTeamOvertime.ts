'use client'

import { useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/axios'
import { toast } from 'sonner'
import type { TeamOvertimeRecord } from '@/types/overtime.types'

interface TeamOvertimeResponse {
  records: TeamOvertimeRecord[]
}

type LooseTeamRecord = Partial<TeamOvertimeRecord> & {
  _id?: string
  recordId?: string
  overtimeId?: string
  overtimeRequestId?: string
  requestId?: string
  overtimeRequest?: {
    id?: string
    _id?: string
    requestId?: string
  }
}

function getErrorMessage(err: unknown, fallback: string) {
  if (typeof err === 'object' && err !== null) {
    const maybeResponse = (err as { response?: { data?: { message?: unknown } } }).response
    const message = maybeResponse?.data?.message
    if (typeof message === 'string' && message.trim().length > 0) return message
  }
  return fallback
}

function normalizeTeamRecord(record: LooseTeamRecord): TeamOvertimeRecord {
  const resolvedId =
    record.id ??
    record._id ??
    record.recordId ??
    record.overtimeId ??
    record.overtimeRequestId ??
    record.requestId ??
    record.overtimeRequest?.id ??
    record.overtimeRequest?._id ??
    record.overtimeRequest?.requestId ??
    ''

  return {
    ...(record as TeamOvertimeRecord),
    id: String(resolvedId),
  }
}

export function useTeamOvertime(enabled: boolean) {
  const [records, setRecords] = useState<TeamOvertimeRecord[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const load = useCallback(async () => {
    if (!enabled) return
    try {
      setIsLoading(true)
      const res = await api.get<TeamOvertimeResponse | TeamOvertimeRecord[]>('/overtime/team', {
        skip401Redirect: true,
      })
      const data = res.data
      const rawRecords = Array.isArray(data) ? data : (data as TeamOvertimeResponse).records ?? []
      setRecords(rawRecords.map((record) => normalizeTeamRecord(record as LooseTeamRecord)))
    } catch (err) {
      toast.error(getErrorMessage(err, 'Error al cargar solicitudes del equipo'))
    } finally {
      setIsLoading(false)
    }
  }, [enabled])

  useEffect(() => {
    if (enabled) load()
  }, [load, enabled])

  return { records, isLoading, reload: load }
}
