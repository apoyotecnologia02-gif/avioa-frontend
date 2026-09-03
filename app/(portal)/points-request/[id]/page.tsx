'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { usePointRequest } from '@/hooks/usePointRequest'
import { api } from '@/lib/axios'
import { useToast } from '@/hooks/use-toast'
import { Loader2, ArrowLeft, CheckCircle, XCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

import { isLeaderOrManagerOrAdminRole } from '@/lib/roles'

export default function PointRequestDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  
  const { user, isLoading: isAuthLoading } = useAuth()
  const { request, isLoading, error, reload } = usePointRequest(id)
  const { toast } = useToast()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showRejectReason, setShowRejectReason] = useState(false)
  const [rejectReason, setRejectReason] = useState('')

  useEffect(() => {
    if (!isAuthLoading && user && !isLeaderOrManagerOrAdminRole(user)) {
      router.push('/dashboard')
    }
  }, [user, isAuthLoading, router])

  if (isAuthLoading || (user && !isLeaderOrManagerOrAdminRole(user))) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const handleApprove = async () => {
    setIsSubmitting(true)
    try {
      await api.patch(`/points/${id}/approve`, {})
      toast({ title: 'Solicitud aprobada exitosamente' })
      await reload()
      router.push('/points-request')
    } catch (err: any) {
      toast({
        title: 'Error al aprobar',
        description: err.response?.data?.message || err.message || 'Error desconocido',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReject = async () => {
    setIsSubmitting(true)
    try {
      await api.patch(`/points/${id}/reject`, {
        ...(rejectReason.trim() ? { reason: rejectReason.trim() } : {})
      })
      toast({ title: 'Solicitud rechazada exitosamente' })
      await reload()
      router.push('/points-request')
    } catch (err: any) {
      toast({
        title: 'Error al rechazar',
        description: err.response?.data?.message || err.message || 'Error desconocido',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
      setShowRejectReason(false)
      setRejectReason('')
    }
  }

  const formatDate = (value?: string | null) => {
    if (!value) return '-'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return 'No disponible'
    return new Intl.DateTimeFormat('es-CO', { dateStyle: 'long', timeStyle: 'short' }).format(date)
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground p-6">
        <Loader2 className="h-4 w-4 animate-spin" />
        Cargando detalle...
      </div>
    )
  }

  if (error || !request) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => router.push('/points-request')} className="-ml-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver a Solicitudes
        </Button>
        <div className="p-4 text-sm text-destructive bg-destructive/10 rounded-md">
          {error || 'No se encontró la solicitud'}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <Button variant="ghost" onClick={() => router.push('/points-request')} className="-ml-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Volver a Solicitudes
      </Button>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle>Detalle de la Solicitud</CardTitle>
              <CardDescription>ID: {request.pointRequestId || id}</CardDescription>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
              request.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
              request.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
              'bg-red-100 text-red-800'
            }`}>
              {request.status === 'PENDING' ? 'PENDIENTE' : 
               request.status === 'APPROVED' ? 'APROBADA' : 'RECHAZADA'}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <span className="text-sm text-muted-foreground">Colaborador</span>
              <p className="font-medium">{request.user?.name || 'Desconocido'}</p>
              {request.user?.email && <p className="text-xs text-muted-foreground">{request.user.email}</p>}
            </div>
            <div className="space-y-1">
              <span className="text-sm text-muted-foreground">Fecha de Solicitud</span>
              <p className="font-medium">{formatDate(request.createdAt)}</p>
            </div>
            <div className="space-y-1 col-span-2">
              <span className="text-sm text-muted-foreground">Puntos Solicitados</span>
              <p className="font-semibold text-primary text-xl">{request.points} pts</p>
            </div>
            <div className="space-y-1 col-span-2">
              <span className="text-sm text-muted-foreground">Motivo / Justificación</span>
              <p className="bg-muted p-4 rounded-md text-sm whitespace-pre-wrap">{request.action}</p>
            </div>
          </div>
        </CardContent>
        {request.status === 'PENDING' && (
          <CardFooter className="flex flex-col gap-4 border-t pt-6">
            {showRejectReason && (
              <div className="w-full space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Motivo de rechazo <span className="text-xs">(opcional)</span>
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Describe el motivo del rechazo..."
                  rows={3}
                  disabled={isSubmitting}
                  className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring disabled:opacity-50"
                />
              </div>
            )}
            <div className="flex justify-end gap-2 w-full">
              {showRejectReason ? (
                <>
                  <Button
                    variant="ghost"
                    onClick={() => { setShowRejectReason(false); setRejectReason('') }}
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="outline"
                    className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                    onClick={handleReject}
                    disabled={isSubmitting}
                  >
                    {isSubmitting
                      ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      : <XCircle className="mr-2 h-4 w-4" />}
                    Confirmar rechazo
                  </Button>
                </>
              ) : (
                <Button
                  variant="outline"
                  className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                  onClick={() => setShowRejectReason(true)}
                  disabled={isSubmitting}
                >
                  <XCircle className="mr-2 h-4 w-4" /> Rechazar
                </Button>
              )}
              <Button
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={handleApprove}
                disabled={isSubmitting}
              >
                {isSubmitting && !showRejectReason
                  ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  : <CheckCircle className="mr-2 h-4 w-4" />}
                Aprobar
              </Button>
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  )
}
