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
  position?: string;
  leaderId?: string;
  managerId?: string;
  avatarUrl?: string;
  phone?: string;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
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
}

export interface AcceptInviteDto {
  token: string;
  password: string;
  confirmPassword: string;
}
