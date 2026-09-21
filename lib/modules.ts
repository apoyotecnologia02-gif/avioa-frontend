export const APP_MODULES = [
  {
    key: "NOMINA",
    label: "Nómina",
    description: "Consolidado de novedades de nómina",
  },
  {
    key: "CESANTIAS",
    label: "Cesantías",
    description: "Solicitudes y gestión de cesantías",
  },
  {
    key: "LEAVES",
    label: "Vacaciones y ausencias",
    description: "Gestión de leaves",
  },
  {
    key: "OVERTIME",
    label: "Horas extra",
    description: "Solicitudes de overtime",
  },
  {
    key: "PASSWORD_VAULT",
    label: "Bóveda de contraseñas",
    description: "Acceso al password vault",
  },
  {
    key: "KNOWLEDGE",
    label: "Base de conocimiento",
    description: "Documentación interna",
  },
  {
    key: "EQUIPMENT_LOANS",
    label: "Préstamo de equipos",
    description: "Solicitudes de equipos",
  },
  {
    key: "MAINTENANCE",
    label: "Mantenimiento",
    description: "Tickets de mantenimiento",
  },
  { key: "FORMS", label: "Formularios", description: "Formularios dinámicos" },
  {
    key: "POINTS",
    label: "Puntos y recompensas",
    description: "Sistema de puntos",
  },
  { key: "FEED", label: "Feed", description: "Publicaciones y novedades" },
  {
    key: "COTIZADOR",
    label: "Cotizador",
    description: "Herramienta de cotización",
  },
  {
    key: "USERS_ADMIN",
    label: "Admin de usuarios",
    description: "Gestionar usuarios del portal",
  },
  {
    key: "USERS_ADMIN_REWARDS",
    label: "Dar acceso de administración de recompensas",
    description: "Gestionar recompensas",
  },
  {
    key: "USERS_ADMIN_VACATIONS",
    label: "Saldos de vacaciones",
    description: "Gestionar saldos de vacaciones",
  },
] as const;

export type AppModuleKey = (typeof APP_MODULES)[number]["key"];
