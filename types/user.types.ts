export enum Role {
  EMPLOYEE = 'EMPLOYEE',
  LEADER = 'LEADER',
  MANAGER = 'MANAGER',
  ADMIN = 'ADMIN',
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
  position?: string
  leaderId?: string
  managerId?: string
}

export interface AcceptInviteDto {
  token: string
  password: string
  confirmPassword: string
}
