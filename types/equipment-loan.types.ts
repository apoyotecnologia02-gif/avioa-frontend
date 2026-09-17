// types/equipment-loan.types.ts
export enum EquipmentStatus {
  AVAILABLE = "AVAILABLE",
  LOANED = "LOANED",
  MAINTENANCE = "MAINTENANCE",
  DAMAGED = "DAMAGED",
}

export enum LoanStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  LOANED = "LOANED",
  RETURNED = "RETURNED",
  REJECTED = "REJECTED",
  CANCELLED = "CANCELLED",
}

export enum EquipmentCategory {
  LAPTOP = "LAPTOP",
  CELLPHONE = "CELLPHONE",
  KEYBOARD = "KEYBOARD",
  MOUSE = "MOUSE",
  HEADPHONES = "HEADPHONES",
  MONITOR = "MONITOR",
  PRINTER = "PRINTER",
  PROJECTOR = "PROJECTOR",
  OTHER = "OTHER",
}

export interface Equipment {
  equipmentId: string;
  name: string;
  serialNumber?: string | null;
  category: EquipmentCategory;
  status: EquipmentStatus;
  locationId?: string | null;
  location?: { name: string } | null;
  description?: string | null;
}

export interface EquipmentLoan {
  equipmentLoanId: string;
  equipmentId: string;
  userId: string;
  reason?: string | null;
  observation?: string | null;
  expectedReturnDate?: string;
  actualReturnDate?: string | null;
  status: LoanStatus;
  approvedById?: string | null;
  returnedById?: string | null;
  equipment?: { name: string } | null;
  user?: { name: string; email: string } | null;
  approvedBy?: { name: string } | null;
  returnedBy?: { name: string } | null;
}

export interface Location {
  locationId: string;
  name: string;
  isActive: boolean;
}