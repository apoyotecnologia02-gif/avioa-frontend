export enum Role {
  EMPLOYEE = 'EMPLOYEE',
  LEADER = 'LEADER',
  MANAGER = 'MANAGER',
  ADMIN = 'ADMIN',
}

export enum Area {
  COMERCIAL = 'Comercial',
  AUXILIAR = 'Auxiliar',
  OPERACIONES = 'Operaciones',
  MERCADEO = 'Mercadeo',
  TECNOLOGIA = 'Tecnología',
  DIRECCION_GERENCIA = 'Dirección / Gerencia',
  RECURSOS_HUMANOS = 'Recursos Humanos',
  CONTABILIDAD = 'Contabilidad',
  SERVICIO_AL_CLIENTE = 'Servicio al cliente',
  PRODUCTO = 'Producto',
  MAYORISTA = 'Mayorista',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING = 'PENDING',
}

export interface User {
  userId: string
  name: string
  email: string
  role: Role
  status: UserStatus
  department?: string
  position?: string
  leaderId?: string
  managerId?: string
  avatarUrl?: string
  phone?: string
  lastLoginAt?: string
  createdAt: string
  updatedAt: string
}

export interface CreateUserDto {
  name: string
  email: string
  role: Role
  department?: string
  area?: string
  position?: string
  leaderId?: string
  managerId?: string
}

export interface AcceptInviteDto {
  token: string
  password: string
  confirmPassword: string
}
