import { CalendarDays, Gift, Shield, UserPlus } from 'lucide-react'

export interface AdminModule {
  key: string
  href: string
  title: string
  description: string
  icon: React.ElementType
}

export const ADMIN_MODULES: AdminModule[] = [
  {
    key: 'users',
    href: '/admin/users',
    title: 'Usuarios',
    description: 'Registro y gestión de usuarios del portal.',
    icon: UserPlus,
  },
  {
    key: 'rewards',
    href: '/admin/rewards',
    title: 'Recompensas',
    description: 'Crear o actualizar recompensas',
    icon: Gift
  },
  {
    key: 'vacations',
    href: '/admin/vacations',
    title: 'Saldos de Vacaciones',
    description: 'Gestión y ajuste de vacaciones acumuladas de colaboradores.',
    icon: CalendarDays,
  }
]

export const ADMIN_ENTRY = {
  href: '/admin',
  label: 'Administración',
  icon: Shield,
}
