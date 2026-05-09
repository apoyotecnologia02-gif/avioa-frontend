'use client'

import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { X, Clock, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { OvertimeStatusBadge } from './OvertimeStatusBadge'
import type { OvertimeRecord } from '@/types/overtime.types'
import { ScrollArea } from '@/components/ui/scroll-area'

interface OvertimeDayPanelProps {
  selectedDate: string | null        // "YYYY-MM-DD"
  records: OvertimeRecord[]
  isLoading: boolean
  onClose: () => void
}

function formatTime(time: string) {
  // time is "HH:mm" or "HH:mm:ss"
  return time.slice(0, 5)
}

export function OvertimeDayPanel({
  selectedDate,
  records,
  isLoading,
  onClose,
}: OvertimeDayPanelProps) {
  if (!selectedDate) return null

  const dateLabel = format(parseISO(selectedDate), "EEEE d 'de' MMMM", { locale: es })

  return (
    <div className="flex flex-col h-full border-l border-border bg-card">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
            Detalle del día
          </p>
          <h3 className="text-base font-semibold capitalize mt-0.5">{dateLabel}</h3>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="shrink-0">
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-5 space-y-3">
          {isLoading ? (
            Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))
          ) : records.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
              <Clock className="h-10 w-10 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">
                No hay horas extra registradas para este día.
              </p>
            </div>
          ) : (
            records.map((record) => (
              <div
                key={record.id}
                className="rounded-xl border border-border bg-background p-4 space-y-3 shadow-sm"
              >
                {/* Time range + total */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 text-sm font-medium">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>
                      {formatTime(record.startTime)} → {formatTime(record.endTime)}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-primary bg-primary/8 px-2 py-0.5 rounded-full">
                    {record.totalHours.toFixed(2)} hrs
                  </span>
                </div>

                {/* Description */}
                <p className="text-sm text-foreground leading-relaxed">{record.description}</p>

                {/* Status */}
                <div className="flex items-start gap-2 flex-wrap">
                  <OvertimeStatusBadge status={record.status} />
                </div>

                {/* Leader comment */}
                {record.comment && (
                  <div className="flex items-start gap-2 rounded-lg bg-muted/50 p-3">
                    <MessageSquare className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {record.comment}
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
