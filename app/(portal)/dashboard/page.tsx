'use client'

import { FileText, Users, TrendingUp, Clock } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/hooks/useAuth'

const stats = [
  {
    title: 'Formularios activos',
    value: '12',
    description: 'Disponibles para completar',
    icon: FileText,
  },
  {
    title: 'Usuarios',
    value: '148',
    description: 'Activos este mes',
    icon: Users,
  },
  {
    title: 'Respuestas',
    value: '1,234',
    description: '+12% vs mes anterior',
    icon: TrendingUp,
  },
  {
    title: 'Pendientes',
    value: '3',
    description: 'Por completar',
    icon: Clock,
  },
]

export default function DashboardPage() {
  const { user } = useAuth()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          Bienvenido, {user?.name?.split(' ')[0] || 'Usuario'}
        </h1>
        <p className="text-muted-foreground">
          Este es tu panel de control. Aquí puedes ver un resumen de tu actividad.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <CardDescription className="text-xs">
                  {stat.description}
                </CardDescription>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Actividad reciente</CardTitle>
            <CardDescription>
              Últimas acciones realizadas en el portal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { action: 'Formulario de vacaciones completado', time: 'Hace 2 horas' },
                { action: 'Solicitud de equipos enviada', time: 'Hace 5 horas' },
                { action: 'Encuesta de clima laboral respondida', time: 'Ayer' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0">
                  <span className="text-sm">{item.action}</span>
                  <span className="text-xs text-muted-foreground">{item.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Formularios pendientes</CardTitle>
            <CardDescription>
              Formularios que requieren tu atención
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: 'Evaluación de desempeño Q1', category: 'RRHH' },
                { name: 'Registro de horas extras', category: 'Operaciones' },
                { name: 'Actualización de datos personales', category: 'General' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0">
                  <span className="text-sm">{item.name}</span>
                  <span className="rounded-full bg-accent px-2 py-0.5 text-xs text-accent-foreground">
                    {item.category}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
