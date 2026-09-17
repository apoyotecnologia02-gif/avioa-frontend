export enum MaintenanceStatus {
  PENDING = "PENDING",
  IN_REVIEW = "IN_REVIEW",
  IN_PROGRESS = "IN_PROGRESS",
  RESOLVED = "RESOLVED",
  REJECTED = "REJECTED",
  CANCELLED = "CANCELLED",
}

export const maintenanceStatusConfig: Record<
  MaintenanceStatus,
  { label: string; className: string }
> = {
  [MaintenanceStatus.PENDING]: {
    label: "Pendiente",
    className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
  },
  [MaintenanceStatus.IN_REVIEW]: {
    label: "En revisión",
    className: "bg-blue-100 text-blue-800 hover:bg-blue-100",
  },
  [MaintenanceStatus.IN_PROGRESS]: {
    label: "En proceso",
    className: "bg-orange-100 text-orange-800 hover:bg-orange-100",
  },
  [MaintenanceStatus.RESOLVED]: {
    label: "Resuelto",
    className: "bg-green-100 text-green-800 hover:bg-green-100",
  },
  [MaintenanceStatus.REJECTED]: {
    label: "Rechazado",
    className: "bg-red-100 text-red-800 hover:bg-red-100",
  },
  [MaintenanceStatus.CANCELLED]: {
    label: "Cancelado",
    className: "bg-gray-100 text-gray-800 hover:bg-gray-100",
  },
};

export interface MaintenanceRequest {
  maintenanceRequestId: string;
  equipmentId: string;
  userId: string;
  reason: string;
  description?: string | null;
  status: MaintenanceStatus;
  assignedToId?: string | null;
  resolvedAt?: string | null;
  resolutionNotes?: string | null;
  rejectedReason?: string | null;
  createdAt: string;
  updatedAt: string;
  equipment?: {
    equipmentId: string;
    name: string;
    serialNumber?: string | null;
    category: string;
    status: string;
    location?: { name: string } | null;
  } | null;
  user?: {
    userId: string;
    name: string;
    email?: string | null;
    area?: string | null;
  } | null;
  assignedTo?: {
    userId: string;
    name: string;
    email?: string | null;
  } | null;
}

export interface CreateMaintenanceDto {
  equipmentId: string;
  reason: string;
  description?: string;
}

export interface UpdateMaintenanceStatusDto {
  status: MaintenanceStatus;
  resolutionNotes?: string;
  rejectedReason?: string;
}

export interface MaintenanceFilters {
  status?: MaintenanceStatus;
  userId?: string;
  equipmentId?: string;
}