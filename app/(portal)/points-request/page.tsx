'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { usePendingRequests } from '@/hooks/usePendingRequests'
import { Loader2, Eye } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'

const ALLOWED_ROLES = ['leader', 'manager', 'admin', 'LEADER', 'MANAGER', 'ADMIN']

export default function PointsRequestPage() {
  const router = useRouter()
  const { user, isLoading: isAuthLoading } = useAuth()
  const { requests, isLoading, error } = usePendingRequests()

  useEffect(() => {
    if (!isAuthLoading && user && !ALLOWED_ROLES.includes(user.role)) {
      router.push('/dashboard')
    }
  }, [user, isAuthLoading, router])

  if (isAuthLoading || (user && !ALLOWED_ROLES.includes(user.role))) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const formatDate = (value?: string | null) => {
    if (!value) return '-'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return 'No disponible'
    return new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Solicitudes de Puntos Pendientes</CardTitle>
          <CardDescription>
            Revisa y gestiona las solicitudes de puntos de tu equipo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="p-4 text-sm text-destructive bg-destructive/10 rounded-md">
              {error}
            </div>
          ) : isLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Cargando solicitudes...
            </div>
          ) : requests.length === 0 ? (
            <p className="text-sm text-muted-foreground p-4 text-center border rounded-md">No hay solicitudes pendientes por el momento.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Colaborador</TableHead>
                  <TableHead>Puntos</TableHead>
                  <TableHead className="hidden md:table-cell">Motivo</TableHead>
                  <TableHead className="hidden sm:table-cell">Fecha</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((req) => (
                  <TableRow key={req.pointRequestId}>
                    <TableCell className="font-medium">
                      {req.user?.name || 'Usuario Desconocido'}
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-primary">{req.points} pts</span>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <span className="line-clamp-1 max-w-[300px]" title={req.action}>
                        {req.action}
                      </span>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">{formatDate(req.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => router.push(`/points-request/${req.pointRequestId}`)}
                      >
                        <Eye className="h-4 w-4 sm:mr-2" />
                        <span className="hidden sm:inline">Revisar</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
