export type LeaveStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";

export type LeaveType =
  | "VACACIONES"
  | "INCAPACIDAD_EPS"
  | "INCAPACIDAD_ARL"
  | "LICENCIA_MATERNIDAD"
  | "LICENCIA_PATERNIDAD"
  | "LICENCIA_LUTO"
  | "LICENCIA_MATRIMONIO"
  | "PERMISO_REMUNERADO"
  | "PERMISO_NO_REMUNERADO"
  | "CALAMIDAD_DOMESTICA"
  | "OTRO";

export interface LeaveRequest {
  leaveRequestId: string;
  userId: string;
  leaderId: string;
  type: LeaveType;
  startDate: string; // ISO
  endDate: string; // ISO
  businessDays: number;
  reason: string;
  attachmentUrl?: string | null;
  status: LeaveStatus;
  comment?: string | null;
  createdAt: string;
  reviewedAt?: string | null;
  user?: {
    name: string;
    avatarUrl?: string | null;
    position?: string | null;
    department?: string | null;
    email?: string;
  };
  leader?: {
    name: string;
    avatarUrl?: string | null;
    email?: string;
  };
}

export interface VacationBalance {
  accrued: number; // días devengados
  taken: number; // días aprobados y consumidos
  pending: number; // días en solicitudes pendientes
  available: number; // accrued - taken
  projectedAvailable: number;
}

export interface CreateLeaveDto {
  type: LeaveType;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  reason: string;
  attachmentUrl?: string;
  leaderId?: string;
}

export interface ReviewLeaveDto {
  status: "APPROVED" | "REJECTED";
  comment?: string;
}

// ----- Metadatos de presentación de cada tipo -----

export interface LeaveTypeMeta {
  label: string;
  short: string;
  /** Consume saldo de vacaciones */
  consumesBalance: boolean;
  /** Requiere adjuntar soporte */
  needsAttachment: boolean;
  /** Clase de color para acentos (Tailwind) */
  accent: string;
  dot: string;
}

export const LEAVE_TYPE_META: Record<LeaveType, LeaveTypeMeta> = {
  VACACIONES: {
    label: "Vacaciones",
    short: "Vacaciones",
    consumesBalance: true,
    needsAttachment: false,
    accent: "text-primary bg-primary/10 border-primary/20",
    dot: "bg-primary",
  },
  INCAPACIDAD_EPS: {
    label: "Incapacidad (EPS)",
    short: "Incap. EPS",
    consumesBalance: false,
    needsAttachment: true,
    accent:
      "text-rose-600 bg-rose-50 border-rose-200 dark:bg-rose-900/20 dark:border-rose-800",
    dot: "bg-rose-500",
  },
  INCAPACIDAD_ARL: {
    label: "Incapacidad (ARL)",
    short: "Incap. ARL",
    consumesBalance: false,
    needsAttachment: true,
    accent:
      "text-orange-600 bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800",
    dot: "bg-orange-500",
  },
  LICENCIA_MATERNIDAD: {
    label: "Licencia de maternidad",
    short: "Maternidad",
    consumesBalance: false,
    needsAttachment: true,
    accent:
      "text-pink-600 bg-pink-50 border-pink-200 dark:bg-pink-900/20 dark:border-pink-800",
    dot: "bg-pink-500",
  },
  LICENCIA_PATERNIDAD: {
    label: "Licencia de paternidad",
    short: "Paternidad",
    consumesBalance: false,
    needsAttachment: true,
    accent:
      "text-sky-600 bg-sky-50 border-sky-200 dark:bg-sky-900/20 dark:border-sky-800",
    dot: "bg-sky-500",
  },
  LICENCIA_LUTO: {
    label: "Licencia por luto",
    short: "Luto",
    consumesBalance: false,
    needsAttachment: false,
    accent:
      "text-slate-600 bg-slate-50 border-slate-200 dark:bg-slate-800/40 dark:border-slate-700",
    dot: "bg-slate-500",
  },
  LICENCIA_MATRIMONIO: {
    label: "Licencia por matrimonio",
    short: "Matrimonio",
    consumesBalance: false,
    needsAttachment: false,
    accent:
      "text-violet-600 bg-violet-50 border-violet-200 dark:bg-violet-900/20 dark:border-violet-800",
    dot: "bg-violet-500",
  },
  PERMISO_REMUNERADO: {
    label: "Permiso remunerado",
    short: "Permiso rem.",
    consumesBalance: false,
    needsAttachment: false,
    accent:
      "text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800",
    dot: "bg-emerald-500",
  },
  PERMISO_NO_REMUNERADO: {
    label: "Permiso no remunerado",
    short: "Permiso no rem.",
    consumesBalance: false,
    needsAttachment: false,
    accent:
      "text-teal-600 bg-teal-50 border-teal-200 dark:bg-teal-900/20 dark:border-teal-800",
    dot: "bg-teal-500",
  },
  CALAMIDAD_DOMESTICA: {
    label: "Calamidad doméstica",
    short: "Calamidad",
    consumesBalance: false,
    needsAttachment: false,
    accent:
      "text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800",
    dot: "bg-amber-500",
  },
  OTRO: {
    label: "Otro",
    short: "Otro",
    consumesBalance: false,
    needsAttachment: false,
    accent:
      "text-gray-600 bg-gray-50 border-gray-200 dark:bg-gray-800/40 dark:border-gray-700",
    dot: "bg-gray-400",
  },
};

export const LEAVE_STATUS_META: Record<
  LeaveStatus,
  { label: string; className: string }
> = {
  PENDING: {
    label: "Pendiente",
    className:
      "text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-400",
  },
  APPROVED: {
    label: "Aprobada",
    className:
      "text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400",
  },
  REJECTED: {
    label: "Rechazada",
    className:
      "text-rose-700 bg-rose-50 border-rose-200 dark:bg-rose-900/20 dark:border-rose-800 dark:text-rose-400",
  },
  CANCELLED: {
    label: "Cancelada",
    className:
      "text-slate-600 bg-slate-50 border-slate-200 dark:bg-slate-800/40 dark:border-slate-700",
  },
};
