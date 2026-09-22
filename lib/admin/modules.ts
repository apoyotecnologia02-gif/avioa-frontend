import { CalendarDays, Gift, KeyRound, Shield, UserPlus } from "lucide-react";
import { AppModuleKey } from "../modules";

export interface AdminModule {
  key: string;
  href: string;
  title: string;
  description: string;
  icon: React.ElementType;
  module?: AppModuleKey;
}

export const ADMIN_MODULES: AdminModule[] = [
  {
    key: "users",
    href: "/admin/users",
    title: "Usuarios",
    description: "Registro y gestión de usuarios del portal.",
    icon: UserPlus,
    module: "USERS_ADMIN",
  },
  {
    key: "rewards",
    href: "/admin/rewards",
    title: "Recompensas",
    description: "Crear o actualizar recompensas",
    icon: Gift,
    module: "USERS_ADMIN_REWARDS",
  },
  {
    key: "vacations",
    href: "/admin/vacations",
    title: "Saldos de Vacaciones",
    description: "Gestión y ajuste de vacaciones acumuladas de colaboradores.",
    icon: CalendarDays,
    module: "USERS_ADMIN_VACATIONS",
  },
  {
    key: "permissions",
    href: "/admin/permissions",
    title: "Permisos",
    description: "Asignar acceso a módulos por usuario.",
    icon: KeyRound,
    module: "USERS_ADMIN",
  },
];

export const ADMIN_ENTRY = {
  href: "/admin",
  label: "Administración",
  icon: Shield,
};
