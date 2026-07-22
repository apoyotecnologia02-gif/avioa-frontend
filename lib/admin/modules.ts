import { Clapperboard, Gift, Shield, UserPlus } from 'lucide-react'

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
  }
]

export const ADMIN_ENTRY = {
  href: '/admin',
  label: 'Administración',
  icon: Shield,
}
