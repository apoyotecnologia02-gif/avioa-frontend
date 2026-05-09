'use client'

import { useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/axios'
import { toast } from 'sonner'
import type { OvertimeRecord } from '@/types/overtime.types'

interface MyOvertimeResponse {
  records: OvertimeRecord[]
}

type LooseMyOvertimeRecord = Partial<OvertimeRecord> & {
  _id?: string
  recordId?: string
}

function getErrorMessage(err: unknown, fallback: string) {
  if (typeof err === 'object' && err !== null) {
    const maybeResponse = (err as { response?: { data?: { message?: unknown } } }).response
    const message = maybeResponse?.data?.message
    if (typeof message === 'string' && message.trim().length > 0) return message
  }
  return fallback
}

function toDateOnly(value: unknown): string {
  if (typeof value !== 'string' || value.trim().length === 0) return ''
  const trimmed = value.trim()
  if (trimmed.includes('T')) return trimmed.split('T')[0]
  if (trimmed.includes(' ')) return trimmed.split(' ')[0]
  return trimmed
}

function normalizeMyOvertimeRecord(record: LooseMyOvertimeRecord): OvertimeRecord {
  return {
    ...(record as OvertimeRecord),
    id: String(record.id ?? record._id ?? record.recordId ?? ''),
    date: toDateOnly(record.date),
    totalHours: Number(record.totalHours ?? 0),
  }
}

export function useMyOvertime() {
  const [records, setRecords] = useState<OvertimeRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      setIsLoading(true)
      const res = await api.get<MyOvertimeResponse | OvertimeRecord[]>('/overtime', {
        skip401Redirect: true,
      })
      // Support both { records: [] } and [] response shapes
      const data = res.data
      const rawRecords = Array.isArray(data) ? data : (data as MyOvertimeResponse).records ?? []
      setRecords(rawRecords.map((record) => normalizeMyOvertimeRecord(record as LooseMyOvertimeRecord)))
    } catch (err) {
      toast.error(getErrorMessage(err, 'Error al cargar tus horas extra'))
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return { records, isLoading, reload: load }
}
