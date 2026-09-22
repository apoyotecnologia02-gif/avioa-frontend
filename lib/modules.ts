export const MODULE_CATEGORIES = {
  RRHH: { label: "Recursos Humanos", order: 1, sensitive: false },
  ACCOUNTING: { label: "Contabilidad", order: 2, sensitive: false },
  HERRAMIENTAS: { label: "Herramientas", order: 3, sensitive: false },
  CONTENIDO: { label: "Contenido y social", order: 4, sensitive: false },
  ADMIN: { label: "Administración", order: 5, sensitive: true },
} as const;

export type ModuleCategory = keyof typeof MODULE_CATEGORIES;

export type ModuleKind = "module" | "capability";

export type AppModuleAction = "create" | "update" | "delete";

export const APP_MODULES = [
  {
    key: "NOMINA",
    kind: "module",
    category: "ACCOUNTING",
    label: "Nómina",
    description: "Consolidado de novedades de nómina",
  },
  {
    key: "CESANTIAS",
    kind: "module",
    category: "RRHH",
    label: "Cesantías",
    description: "Solicitudes y gestión de cesantías",
  },
  {
    key: "LEAVES",
    kind: "module",
    category: "RRHH",
    label: "Vacaciones y ausencias",
    description: "Solicitudes de vacaciones y ausencias",
  },
  {
    key: "OVERTIME",
    kind: "module",
    category: "RRHH",
    label: "Horas extra",
    description: "Registro y aprobación de horas extra",
  },

  // ── Herramientas ──────────────────────────────────────
  {
    key: "KNOWLEDGE",
    kind: "module",
    category: "HERRAMIENTAS",
    label: "Base de conocimiento",
    description: "Documentación interna y biblioteca",
    action: ["create", "update", "delete"],
  },
  {
    key: "EQUIPMENT_LOANS",
    kind: "module",
    category: "HERRAMIENTAS",
    label: "Préstamo de equipos",
    description: "Solicitudes de equipos",
    action: ["create", "update", "delete"],
  },
  {
    key: "MAINTENANCE",
    kind: "module",
    category: "HERRAMIENTAS",
    label: "Mantenimiento",
    description: "Tickets de mantenimiento",
    action: ["create", "update", "delete"],
  },
  {
    key: "FORMS",
    kind: "module",
    category: "HERRAMIENTAS",
    label: "Formularios",
    description: "Formularios dinámicos",
    action: ["create", "update", "delete"],
  },
  {
    key: "COTIZADOR",
    kind: "module",
    category: "HERRAMIENTAS",
    label: "Cotizador",
    description: "Herramienta de cotización",
  },

  {
    key: "POINTS",
    kind: "module",
    category: "CONTENIDO",
    label: "Puntos y recompensas",
    description: "Sistema de puntos",
  },
  {
    key: "FEED",
    kind: "module",
    category: "CONTENIDO",
    label: "Feed",
    description: "Publicaciones y novedades",
    action: ["create", "update", "delete"],
  },

  // ── Administración (capacidades) ──────────────────────
  {
    key: "USERS_ADMIN",
    kind: "capability",
    category: "ADMIN",
    label: "Gestionar usuarios",
    description: "Crear, editar y desactivar usuarios del portal",
  },
  {
    key: "USERS_ADMIN_REWARDS",
    kind: "capability",
    category: "ADMIN",
    label: "Gestionar recompensas",
    description: "Administrar catálogo y asignación de recompensas",
  },
  {
    key: "USERS_ADMIN_VACATIONS",
    kind: "capability",
    category: "ADMIN",
    label: "Gestionar saldos de vacaciones",
    description: "Editar y aprobar saldos de vacaciones",
  },
] as const;

export type AppModuleKey = (typeof APP_MODULES)[number]["key"];

export const APP_MODULE_KEYS = new Set<string>(APP_MODULES.map((m) => m.key));

export function getModuleActions(
  key: AppModuleKey,
): readonly AppModuleAction[] {
  const mod = APP_MODULES.find((m) => m.key === key);
  if (!mod || !("action" in mod) || !Array.isArray(mod.action)) return [];
  return mod.action as readonly AppModuleAction[];
}
