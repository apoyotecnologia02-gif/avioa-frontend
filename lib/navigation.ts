import type { ElementType } from "react";
import {
  Home,
  User,
  Clock,
  Gift,
  FileText,
  ClipboardCheck,
  Shield,
  Coins,
  History,
  ClipboardList,
  UserPlus,
  Users,
} from "lucide-react";

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
  exact?: boolean;
}

export interface NavGroup {
  /** clave unica, usada para persistir el estado abierto/cerrado */
  key: string;
  label: string;
  icon: ElementType;
  visibility?: NavVisibility;

  /** si tiene items, se renderiza como desplegable. Si solo tiene href, es link directo */
  href?: string;
  items?: NavLeaf[];
}

export interface NavSection {
  /** Etiqueta de seccion (ej: "GESTIóN"). null = sin etiqueta */
  label: string | null;
  visibility?: NavVisibility;
  groups: NavGroup[];
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
          // PROXIMAMENTE
          // { href: "/leaves", label: "Vacaciones y ausencias" }
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
      {
        key: "beneficios",
        label: "Beneficios",
        icon: Gift,
        items: [
          { href: "/points", label: "Mis puntos", icon: Coins, exact: true },
          { href: "/points/history", label: "Historial", icon: History },
          {
            href: "/points/my-requests",
            label: "Mis solicitudes",
            icon: ClipboardList,
          },
          // PROXIMAMENTE
          // { href: "/benefits", label: "Convenios y descuentos", icon: Store },
          // { href: "/celebrations", label: "Celebraciones", icon: CalendarDays }
        ],
      },
      { key: "forms", label: "Formularios", icon: FileText, href: "/forms" },
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
      {
        key: "aprobaciones",
        label: "Aprobaciones",
        icon: ClipboardCheck,
        // Hoy apunta a solicitudes de puntos; cuando exista la bandeja
        // unificada, toca cambiar el href a "/approvals".
        href: "/points-request",
        visibility: "leader",
      },
      
        {
          key: "Public",
          label: "Public",
          icon: Users,
          href: "/my-team",
          visibility: "admin",
        },
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
          { href: "/admin/users", label: "Usuarios", icon: UserPlus },
          { href: "/admin/rewards", label: "Recompensas", icon: Gift },
          // PROXIMAMENTE
          // { href: "/admin/templates", label: "Plantillas", icon: FolderOpen },
          // { href: "/admin/rewards", label: "Recompensas", icon: Gift }
        ],
      },
    ],
  },
];
