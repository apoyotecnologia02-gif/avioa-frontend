import type { ElementType } from "react";
import {
  Home,
  User,
  Clock,
  Gift,
  FileText,
  Shield,
  UserPlus,
  Users,
  Key,
  Calculator,
  CalendarDays,
  Book,
  DollarSign,
} from "lucide-react";
import { AppModuleKey } from "./modules";
import { hasModuleAccess, UserWithModules } from "./permissions";

/**
 * Quien puede ver un item o grupo:
 * - "all": todos los empleados
 * - "leader": solo LEADER, MANAGER, ADMIN
 * - "admin": solo ADMIN
 */

export type NavVisibility = "all" | "leader" | "admin";

export interface NavLeaf {
  href: string;
  label: string;
  icon?: ElementType;
  visibility?: NavVisibility;

  /** true = coincide solo con la ruta exacta */
  module?: AppModuleKey;
  exact?: boolean;
}

export interface NavGroup {
  /** clave unica, usada para persistir el estado abierto/cerrado */
  key: string;
  label: string;
  icon: ElementType;
  visibility?: NavVisibility;

  /** si tiene items, se renderiza como desplegable. Si solo tiene href, es link directo */
  module?: AppModuleKey;
  href?: string;
  items?: NavLeaf[];
}

export interface NavSection {
  /** Etiqueta de seccion (ej: "GESTIóN"). null = sin etiqueta */
  label: string | null;
  visibility?: NavVisibility;
  groups: NavGroup[];
}

function matchesVisibility(
  user: UserWithModules | null | undefined,
  visibility: NavVisibility,
): boolean {
  if (!visibility || visibility === "all") return true;
  const role = user?.role?.toUpperCase();

  if (role === "ADMIN") return true;
  if (visibility === "admin") return false;
  if (visibility === "leader") {
    return role === "LEADER" || role === "MANAGER" || role === "RRHH";
  }
  return true;
}

function filterLeaf(user: UserWithModules | null | undefined, leaf: NavLeaf) {
  if (leaf.module && !hasModuleAccess(user, leaf.module)) return null;
  if (!matchesVisibility(user, leaf.visibility as NavVisibility)) return null;
  return leaf;
}

export function getVisibleNavSections(
  user: UserWithModules | null | undefined,
): NavSection[] {
  return NAV_SECTIONS.map((section) => {
    if (!matchesVisibility(user, section.visibility as NavVisibility))
      return null;

    const groups = section.groups
      .map((group) => {
        if (group.module && !hasModuleAccess(user, group.module)) return null;
        if (!matchesVisibility(user, group.visibility as NavVisibility))
          return null;

        if (group.items) {
          const items = group.items
            .map((leaf) => filterLeaf(user, leaf))
            .filter((l): l is NavLeaf => l !== null);

          if (items.length === 0) return null;
          return { ...group, items };
        }

        return group;
      })
      .filter((g): g is NavGroup => g !== null);

    if (groups.length === 0) return null;
    return { ...section, groups };
  }).filter((s): s is NavSection => s !== null);
}

/**
 * ESTRUCTURA DE NAVEGACIÓN DEL PORTAL
 *
 * Para agregar un módulo nuevo (ej: Vacaciones), solo agrega el NavLeaf
 * en el grupo correspondiente. No hay qye toocar el componente Sidebar.
 *
 * Los items marcados con "// PROXIMAMENTE" estan comentados: se descomentan
 * a medida que se implementen los modulos correspondientes.
 */

export const NAV_SECTIONS: NavSection[] = [
  {
    label: null,
    groups: [
      { key: "home", label: "Inicio", icon: Home, href: "/dashboard" },
      {
        key: "mi-espacio",
        label: "Mi espacio",
        icon: User,
        items: [
          { href: "/profile", label: "Mi perfil" },
          // PROXIMAMENTE
          // { href: "/my-documents", label: "Mis documentos" },
          // { href: "/my requests", label: "Mis solicitudes" }
        ],
      },
      {
        key: "Organización",
        label: "Organización",
        visibility: "all",
        icon: Users,
        items: [
          { href: "/colaboradores", label: "Colaboradores" },
          // { href: "/equipment-requests", label: "Solicitud Equipos" },
          // { href: "/books-files", label: "Biblioteca" }
        ],
      },
      {
        key: "tiempo",
        label: "Tiempo",
        icon: Clock,
        items: [
          { href: "/overtime", label: "Horas extra" },
          // PROXIMAMENTE
          { href: "/leaves", label: "Vacaciones y ausencias" },
        ],
      },
      // {
      //   key: "beneficios",
      //   label: "Beneficios",
      //   icon: Gift,
      //   items: [
      //     { href: "/points", label: "Mis puntos", icon: Coins, exact: true },
      //     { href: "/points/history", label: "Historial", icon: History },
      //     {
      //       href: "/points/my-requests",
      //       label: "Mis solicitudes",
      //       icon: ClipboardList,
      //     },
      //     // PROXIMAMENTE
      //     // { href: "/benefits", label: "Convenios y descuentos", icon: Store },
      //     // { href: "/celebrations", label: "Celebraciones", icon: CalendarDays }
      //   ],
      // },
      { key: "forms", label: "Formularios", icon: FileText, href: "/forms" },
      {
        key: "cotizador",
        label: "Cotizador",
        icon: Calculator,
        href: "/cotizador",
      },
      {
        key: "biblioteca",
        label: "Biblioteca",
        icon: Book,
        href: "/knowledge",
      },
      // PROXIMAMENTE
      //   {
      //     key: "comunicacion",
      //     label: "Comunicación",
      //     icon: Megaphone,
      //     items: [
      //       { href: "/announcements", label: "Comunicados" },
      //       { href: "/directory", label: "Directorio" },
      //       { href: "/org-chart", label: "Organigrama" },
      //     ],
      //   },
    ],
  },
  {
    label: "Gestión",
    visibility: "leader",
    groups: [
      // {
      //   key: "aprobaciones",
      //   label: "Aprobaciones",
      //   icon: ClipboardCheck,
      //   // Hoy apunta a solicitudes de puntos; cuando exista la bandeja
      //   // unificada, toca cambiar el href a "/approvals".
      //   href: "/points-request",
      //   visibility: "leader",
      // },
      // {
      //   key: "Public",
      //   label: "Aprobar Publicaciones",
      //   icon: Users,
      //   href: "/approvePost",
      //   visibility: "admin",
      // },
    ],
  },
  {
    label: "Administración",
    visibility: "admin",
    groups: [
      {
        key: "admin",
        label: "Administración",
        icon: Shield,
        visibility: "admin",
        items: [
          {
            href: "/admin/users",
            label: "Usuarios",
            icon: UserPlus,
            module: "USERS_ADMIN",
          },
          {
            href: "/admin/rewards",
            label: "Recompensas",
            icon: Gift,
            module: "USERS_ADMIN",
          },
          {
            href: "/admin/vacations",
            label: "Saldos de Vacaciones",
            icon: CalendarDays,
            module: "USERS_ADMIN",
          },
          {
            href: "/nomina",
            label: "Nomina",
            icon: DollarSign,
            module: "NOMINA",
          },
        ],
      },
    ],
  },
  {
    label: "Contraseñas",
    visibility: "all",
    groups: [
      {
        key: "contraseñas",
        label: "Gestión de Contraseñas",
        icon: Key,
        // visibility: "all",
        // items: [{ href: "/passwords", label: "Contraseñas", icon: Key }],
        href: "/passwords",
        visibility: "all",
      },
    ],
  },
];
