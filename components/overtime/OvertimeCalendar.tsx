'use client'

import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  format,
  isSameMonth,
  isToday,
  addMonths,
  subMonths,
} from 'date-fns'
import { es } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { OvertimeDaySummary, OvertimeStatus } from '@/types/overtime.types'

const WEEKDAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

function getDominantStatus(day: OvertimeDaySummary): OvertimeStatus | null {
  if (day.totalRejected > 0 && day.totalPending === 0 && day.totalApproved === 0) return 'REJECTED'
  if (day.totalPending > 0) return 'PENDING'
  if (day.totalApproved > 0) return 'APPROVED'
  if (day.totalRejected > 0) return 'REJECTED'
  return null
}

const STATUS_DOT: Record<OvertimeStatus, string> = {
  PENDING: 'bg-amber-400',
  APPROVED: 'bg-emerald-500',
  REJECTED: 'bg-red-500',
}

interface OvertimeCalendarProps {
  currentDate: Date
  onMonthChange: (date: Date) => void
  daySummaries: OvertimeDaySummary[]
  selectedDate: string | null
  onSelectDate: (date: string) => void
  isLoading: boolean
}

export function OvertimeCalendar({
  currentDate,
  onMonthChange,
  daySummaries,
  selectedDate,
  onSelectDate,
  isLoading,
}: OvertimeCalendarProps) {
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Map day date strings to their summary
  const summaryMap = new Map<string, OvertimeDaySummary>()
  for (const ds of daySummaries) {
    summaryMap.set(ds.date, ds)
  }

  // Leading empty cells for first week
  const leadingBlanks = getDay(monthStart) // 0=Sun

  const handlePrev = () => onMonthChange(subMonths(currentDate, 1))
  const handleNext = () => onMonthChange(addMonths(currentDate, 1))

  const monthLabel = format(currentDate, 'MMMM yyyy', { locale: es })

  return (
    <div className="flex flex-col gap-4">
      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold capitalize">{monthLabel}</h2>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" onClick={handlePrev} aria-label="Mes anterior">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleNext} aria-label="Mes siguiente">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-7 gap-1">
          {WEEKDAYS.map((d) => (
            <div key={d} className="text-center text-xs text-muted-foreground font-medium py-2">
              {d}
            </div>
          ))}
          {Array.from({ length: 35 }).map((_, i) => (
            <Skeleton key={i} className="h-14 rounded-lg" />
          ))}
        </div>
      ) : (
        <>
          {/* Desktop grid */}
          <div className="hidden sm:grid grid-cols-7 gap-1.5">
            {WEEKDAYS.map((d) => (
              <div
                key={d}
                className="text-center text-xs text-muted-foreground font-semibold uppercase tracking-wider py-2"
              >
                {d}
              </div>
            ))}

            {/* Leading blanks */}
            {Array.from({ length: leadingBlanks }).map((_, i) => (
              <div key={`blank-${i}`} />
            ))}

            {/* Day cells */}
            {days.map((day) => {
              const dateStr = format(day, 'yyyy-MM-dd')
              const summary = summaryMap.get(dateStr)
              const dominant = summary ? getDominantStatus(summary) : null
              const isSelected = selectedDate === dateStr
              const todayDay = isToday(day)

              return (
                <button
                  key={dateStr}
                  onClick={() => onSelectDate(isSelected ? '' : dateStr)}
                  className={cn(
                    'relative flex flex-col items-center justify-start gap-1 rounded-xl border p-2 min-h-[4rem] transition-all text-sm font-medium',
                    'hover:bg-accent hover:border-accent-foreground/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    isSelected
                      ? 'bg-primary text-primary-foreground border-primary shadow-md'
                      : todayDay
                        ? 'border-primary/50 bg-primary/5'
                        : 'border-border bg-background',
                    !isSameMonth(day, currentDate) && 'opacity-30',
                  )}
                  aria-label={`${dateStr}${summary ? ` - ${summary.totalHours} hrs` : ''}`}
                  aria-pressed={isSelected}
                >
                  <span
                    className={cn(
                      'text-xs font-semibold',
                      todayDay && !isSelected && 'text-primary',
                    )}
                  >
                    {format(day, 'd')}
                  </span>

                  {summary && dominant && (
                    <div className="flex items-center gap-0.5">
                      <span
                        className={cn(
                          'h-1.5 w-1.5 rounded-full',
                          isSelected ? 'bg-primary-foreground' : STATUS_DOT[dominant],
                        )}
                      />
                      <span
                        className={cn(
                          'text-[9px] font-semibold',
                          isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground',
                        )}
                      >
                        {summary.totalHours.toFixed(1)}h
                      </span>
                    </div>
                  )}
                </button>
              )
            })}
          </div>

          {/* Mobile list — only days with activity */}
          <div className="flex flex-col gap-2 sm:hidden">
            {days
              .filter((day) => summaryMap.has(format(day, 'yyyy-MM-dd')))
              .map((day) => {
                const dateStr = format(day, 'yyyy-MM-dd')
                const summary = summaryMap.get(dateStr)!
                const dominant = getDominantStatus(summary)
                const isSelected = selectedDate === dateStr

                return (
                  <button
                    key={dateStr}
                    onClick={() => onSelectDate(isSelected ? '' : dateStr)}
                    className={cn(
                      'flex items-center justify-between rounded-xl border p-3 text-sm transition-all',
                      isSelected
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'border-border bg-background hover:bg-accent',
                    )}
                  >
                    <span className="font-medium capitalize">
                      {format(day, "EEEE d 'de' MMMM", { locale: es })}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold">
                        {summary.totalHours.toFixed(1)} hrs
                      </span>
                      {dominant && (
                        <span
                          className={cn(
                            'h-2 w-2 rounded-full',
                            isSelected ? 'bg-primary-foreground' : STATUS_DOT[dominant],
                          )}
                        />
                      )}
                    </div>
                  </button>
                )
              })}

            {daySummaries.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-6">
                No hay registros este mes.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  )
}
