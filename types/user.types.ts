import { NumberFormatState } from "react-number-format/types/types";

export enum Role {
  EMPLOYEE = "EMPLOYEE",
  LEADER = "LEADER",
  MANAGER = "MANAGER",
  ADMIN = "ADMIN",
}

export enum Area {
  COMERCIAL = "Comercial",
  AUXILIARES = "Auxiliares",
  MAYORISTA = "Mayorista",
  MERCADEO = "Mercadeo",
  TECNOLOGIA = "Tecnología",
  DIRECCION_GERENCIA = "Dirección / Gerencia",
  GESTION_HUMANA = "Gestión Humana",
  CONTABILIDAD = "Contabilidad",
  SERVICIO_AL_CLIENTE = "Servicio al cliente",
  PRODUCTO = "Producto",
  RESERVAS = "Reservas",
  BUEN_VIVIR = "Buen Vivir",
}

export enum UserStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  SUSPENDED = "SUSPENDED",
  PENDING = "PENDING",
}

export interface User {
  userId: string;
  name: string;
  email: string;
  role: Role;
  status: UserStatus;
  department?: string;
  area?: string;
  position?: string;
  leaderId?: string;
  managerId?: string;
  avatarUrl?: string;
  phone?: string;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
  canPublishInFeed?: boolean;
  isLeader?: boolean;
  vacationDaysAdjustment?: number;
}

export interface CreateUserDto {
  name: string;
  email: string;
  role: Role;
  department?: string;
  area?: string;
  birthDate?: Date;
  position?: string;
  leaderId?: string;
  managerId?: string;
  startDate?: Date;
  documentType?: DocumentType;
  documentNumber?: string;
  office?: string;
  contractType?: ContractType;
  eps?: string;
  afp?: string;
  arl?: string;
  salary?: number;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRel?: string;
  vacationDaysAdjustment?: number;
}

export interface AcceptInviteDto {
  token: string;
  password: string;
  confirmPassword: string;
}

export enum DocumentType {
  CC = "CC", // Cedula de ciudadania
  CE = "CE", // Cedula de extranjeria
  PA = "PA", // Pasaporte
  PEP = "PEP", // Permiso especial de permanencia
  TI = "TI", // Tarjeta de identidad
}

export enum ContractType {
  INDEFINIDO = "INDEFINIDO",
  FIJO = "FIJO",
  OBRA_LABOR = "OBRA_LABOR",
  APRENDIZAJE = "APRENDIZAJE",
  PRESTACION = "PRESTACION",
}

export enum Office {
  BOGOTA = "BOGOTA",
  GUARNE = "GUARNE",
  NUEVA_AVENIDA = "NUEVA AVENIDA",
  EL_PENOL = "EL PEÑOL",
  MARINILLA_PARQUE = "MARINILLA PARQUE",
  MARINILLA_INDUSTRIAL = "MARINILLA INDUSTRIAL",
  MEDELLIN = "MEDELLIN",
  SAN_ANTONIO = "SAN ANTONIO",
  SANTUARIO_PARQUE = "SANTUARIO PARQUE",
  SANTUARIO_CALLE_DEL_COMERCIO = "SANTUARIO CALLE DEL COMERCIO",
  TELETRABAJO = "TELETRABAJO",
}
