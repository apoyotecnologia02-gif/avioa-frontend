'use client'

import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { CheckCircle2, XCircle, Clock, MessageSquare } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'sonner'
import { OvertimeStatusBadge } from './OvertimeStatusBadge'
import type { OvertimeRecord, TeamOvertimeRecord } from '@/types/overtime.types'


interface ReviewOvertimeModalProps {
  isOpen: boolean
  onClose: () => void
  records: TeamOvertimeRecord[]
  myRecords: OvertimeRecord[]
  isLoading: boolean
  onReview: (id: string, status: 'APPROVED' | 'REJECTED', comment: string) => Promise<void>
  isReviewing: boolean
}

type TabValue = 'all' | 'PENDING' | 'APPROVED' | 'REJECTED'
type ViewMode = 'TEAM' | 'MINE'

interface ConfirmState {
  recordId: string
  action: 'APPROVED' | 'REJECTED'
  employeeName: string
}

type LooseReviewRecord = Partial<TeamOvertimeRecord> & {
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

function getInitials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

function formatTime(time: string) {
  return time.slice(0, 5)
}

function getReviewRecordId(record: TeamOvertimeRecord): string {
  const source = record as LooseReviewRecord
  return (
    source.id ??
    source._id ??
    source.recordId ??
    source.overtimeId ??
    source.overtimeRequestId ??
    source.requestId ??
    source.overtimeRequest?.id ??
    source.overtimeRequest?._id ??
    source.overtimeRequest?.requestId ??
    ''
  )
}

export function ReviewOvertimeModal({
  isOpen,
  onClose,
  records,
  myRecords,
  isLoading,
  onReview,
  isReviewing,
}: ReviewOvertimeModalProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('TEAM')
  const [activeTab, setActiveTab] = useState<TabValue>('PENDING')
  const [confirm, setConfirm] = useState<ConfirmState | null>(null)
  const [comment, setComment] = useState('')
  const [confirmError, setConfirmError] = useState<string | null>(null)

  const sourceRecords = viewMode === 'TEAM' ? records : myRecords
  const filtered = sourceRecords.filter((r) => {
    if (activeTab === 'all') return true
    return r.status === activeTab
  })

  const pendingCount = sourceRecords.filter((r) => r.status === 'PENDING').length

  const openConfirm = (record: TeamOvertimeRecord, action: 'APPROVED' | 'REJECTED') => {
    const recordId = getReviewRecordId(record)
    if (!recordId) {
      toast.error('No se pudo identificar la solicitud a revisar')
      return
    }
    setConfirm({ recordId, action, employeeName: record.user.name })
    setComment('')
    setConfirmError(null)
  }

  const handleConfirm = async () => {
    if (!confirm) return
    try {
      setConfirmError(null)
      await onReview(confirm.recordId, confirm.action, comment)
      setConfirm(null)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al procesar la solicitud'
      setConfirmError(msg)
    }
  }

  const TAB_ITEMS: { value: TabValue; label: string; badge?: number }[] = [
    { value: 'PENDING', label: 'Pendientes', badge: pendingCount > 0 ? pendingCount : undefined },
    { value: 'APPROVED', label: 'Aprobadas' },
    { value: 'REJECTED', label: 'Rechazadas' },
    { value: 'all', label: 'Todas' },
  ]

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="flex max-h-[90dvh] w-[calc(100%-1.5rem)] flex-col overflow-hidden sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Revisar Solicitudes de Horas Extra</DialogTitle>
            <DialogDescription>
              Separa lo que revisas de tu equipo y tus propias solicitudes.
            </DialogDescription>
          </DialogHeader>

          <Tabs
            value={viewMode}
            onValueChange={(value) => {
              setViewMode(value as ViewMode)
              setActiveTab('PENDING')
            }}
            className="shrink-0"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="TEAM">Equipo</TabsTrigger>
              <TabsTrigger value="MINE">Mis solicitudes</TabsTrigger>
            </TabsList>
          </Tabs>

          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as TabValue)}
            className="flex flex-col flex-1 min-h-0"
          >
            <TabsList className="grid w-full shrink-0 grid-cols-2 sm:grid-cols-4">
              {TAB_ITEMS.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value} className="relative text-xs gap-1.5">
                  {tab.label}
                  {tab.badge !== undefined && (
                    <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 text-white text-[10px] font-bold px-1">
                      {tab.badge}
                    </span>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>

            {TAB_ITEMS.map((tab) => (
              <TabsContent key={tab.value} value={tab.value} className="flex-1 min-h-0 mt-3 data-[state=active]:flex data-[state=active]:flex-col">
                <ScrollArea className="h-[min(420px,50dvh)] min-h-0 shrink pr-1">
                  <div className="space-y-3 pb-2">
                    {isLoading ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-36 rounded-xl" />
                      ))
                    ) : filtered.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                        <Clock className="h-10 w-10 text-muted-foreground/30" />
                        <p className="text-sm text-muted-foreground">
                          No hay solicitudes en esta categoría.
                        </p>
                      </div>
                    ) : (
                      filtered.map((record) => (
                        <div
                          key={viewMode === 'TEAM' ? getReviewRecordId(record as TeamOvertimeRecord) : record.id}
                          className="rounded-xl border border-border bg-background p-4 space-y-3 shadow-sm"
                        >
                          {/* Employee info */}
                          {viewMode === 'TEAM' ? (
                            <div className="flex items-center gap-3">
                              <Avatar className="h-9 w-9 shrink-0">
                                <AvatarImage src={(record as TeamOvertimeRecord).user.avatarUrl} alt={(record as TeamOvertimeRecord).user.name} />
                                <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
                                  {getInitials((record as TeamOvertimeRecord).user.name)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold truncate">{(record as TeamOvertimeRecord).user.name}</p>
                                {((record as TeamOvertimeRecord).user.position || (record as TeamOvertimeRecord).user.department) && (
                                  <p className="text-xs text-muted-foreground truncate">
                                    {[(record as TeamOvertimeRecord).user.position, (record as TeamOvertimeRecord).user.department]
                                      .filter(Boolean)
                                      .join(' · ')}
                                  </p>
                                )}
                              </div>
                              <OvertimeStatusBadge status={record.status} />
                            </div>
                          ) : (
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-semibold">Mi solicitud</p>
                              <OvertimeStatusBadge status={record.status} />
                            </div>
                          )}

                          {/* Date & time */}
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                            <span className="text-muted-foreground capitalize">
                              {format(parseISO(record.date), "d 'de' MMMM yyyy", { locale: es })}
                            </span>
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Clock className="h-3.5 w-3.5" />
                              <span>
                                {formatTime(record.startTime)} → {formatTime(record.endTime)}
                              </span>
                              <span className="font-semibold text-foreground ml-1">
                                ({record.totalHours.toFixed(2)} hrs)
                              </span>
                            </div>
                          </div>

                          {/* Description */}
                          <p className="text-sm text-foreground leading-relaxed">
                            {record.description}
                          </p>

                          {/* Leader comment */}
                          {record.comment && (
                            <div className="flex items-start gap-2 rounded-lg bg-muted/50 p-2.5">
                              <MessageSquare className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                              <p className="text-xs text-muted-foreground">{record.comment}</p>
                            </div>
                          )}

                          {/* Actions */}
                          {viewMode === 'TEAM' && record.status === 'PENDING' && (
                            <div className="flex items-center gap-2 pt-1">
                              <Button
                                size="sm"
                                variant="outline"
                                className="gap-1.5 text-emerald-700 border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300 dark:text-emerald-400 dark:border-emerald-800 dark:hover:bg-emerald-900/20"
                                onClick={() => openConfirm(record as TeamOvertimeRecord, 'APPROVED')}
                                disabled={isReviewing}
                              >
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Aprobar
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="gap-1.5 text-red-700 border-red-200 hover:bg-red-50 hover:border-red-300 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/20"
                                onClick={() => openConfirm(record as TeamOvertimeRecord, 'REJECTED')}
                                disabled={isReviewing}
                              >
                                <XCircle className="h-3.5 w-3.5" />
                                Rechazar
                              </Button>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>
            ))}
          </Tabs>

          <DialogFooter className="mt-2 shrink-0">
            <Button variant="outline" onClick={onClose}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm sub-dialog */}
      <AlertDialog open={!!confirm} onOpenChange={(open) => !open && setConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirm?.action === 'APPROVED' ? 'Aprobar solicitud' : 'Rechazar solicitud'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirm?.action === 'APPROVED'
                ? `¿Confirmas que deseas aprobar las horas extra de ${confirm?.employeeName}?`
                : `¿Confirmas que deseas rechazar las horas extra de ${confirm?.employeeName}?`}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-2 py-2">
            <label className="text-sm font-medium flex items-center gap-1.5">
              <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
              Comentario (opcional)
            </label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Agrega un comentario para el empleado..."
              className="resize-none min-h-[80px]"
            />
            {confirmError && (
              <p className="text-xs text-destructive">{confirmError}</p>
            )}
          </div>

          <AlertDialogFooter>
            <Button variant="outline" onClick={() => setConfirm(null)} disabled={isReviewing}>
              Cancelar
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={isReviewing}
              variant={confirm?.action === 'APPROVED' ? 'default' : 'destructive'}
            >
              {isReviewing
                ? 'Procesando...'
                : confirm?.action === 'APPROVED'
                  ? 'Confirmar aprobación'
                  : 'Confirmar rechazo'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
