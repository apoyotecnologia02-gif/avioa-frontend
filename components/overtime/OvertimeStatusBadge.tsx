'use client'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { OvertimeStatus } from '@/types/overtime.types'

interface OvertimeStatusBadgeProps {
  status: OvertimeStatus
  className?: string
}

const STATUS_CONFIG: Record<
  OvertimeStatus,
  { label: string; className: string }
> = {
  PENDING: {
    label: 'Pendiente',
    className:
      'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
  },
  APPROVED: {
    label: 'Aprobado',
    className:
      'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800',
  },
  REJECTED: {
    label: 'Rechazado',
    className:
      'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
  },
}

export function OvertimeStatusBadge({ status, className }: OvertimeStatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.PENDING
  return (
    <Badge
      variant="outline"
      className={cn('font-medium text-xs px-2 py-0.5', config.className, className)}
    >
      {config.label}
    </Badge>
  )
}
