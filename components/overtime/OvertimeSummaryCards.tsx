'use client'

import { Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import type { OvertimeSummary } from '@/types/overtime.types'

interface OvertimeSummaryCardsProps {
  summary: OvertimeSummary | null
  isLoading: boolean
}

export function OvertimeSummaryCards({ summary, isLoading }: OvertimeSummaryCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
    )
  }

  const totalHoursNumber = Number(summary?.totalHours)
  const totalHoursValue = Number.isFinite(totalHoursNumber)
    ? `${totalHoursNumber.toFixed(1)} hrs`
    : '—'

  const cards = [
    {
      label: 'Total de horas',
      value: totalHoursValue,
      icon: Clock,
      iconClass: 'text-primary',
      bgClass: 'bg-primary/5 border-primary/20',
    },
    {
      label: 'Pendientes',
      value: summary?.totalPending ?? '—',
      icon: AlertCircle,
      iconClass: 'text-amber-500',
      bgClass: 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800',
    },
    {
      label: 'Aprobadas',
      value: summary?.totalApproved ?? '—',
      icon: CheckCircle2,
      iconClass: 'text-emerald-500',
      bgClass: 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800',
    },
    {
      label: 'Rechazadas',
      value: summary?.totalRejected ?? '—',
      icon: XCircle,
      iconClass: 'text-red-500',
      bgClass: 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800',
    },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <div
            key={card.label}
            className={`rounded-xl border p-4 flex flex-col gap-2 ${card.bgClass}`}
          >
            <div className="flex items-center gap-2">
              <Icon className={`h-4 w-4 shrink-0 ${card.iconClass}`} />
              <span className="text-xs font-medium text-muted-foreground">{card.label}</span>
            </div>
            <p className="text-2xl font-bold tracking-tight">{card.value}</p>
          </div>
        )
      })}
    </div>
  )
}
