export enum Permission {
  // Users Management
  USERS_MANAGE = 'users:manage',
  USERS_VIEW = 'users:view',

  // Equipment Loans
  EQUIPMENT_MANAGE = 'equipment:manage',
  EQUIPMENT_USE = 'equipment:use',

  // Leaves & Ausencias
  LEAVES_MANAGE = 'leaves:manage',
  LEAVES_APPROVE = 'leaves:approve',
  LEAVES_CREATE = 'leaves:create',

  // Cesantías
  CESANTIAS_MANAGE = 'cesantias:manage',
  CESANTIAS_CREATE = 'cesantias:create',

  // Overtime / Horas Extra
  OVERTIME_MANAGE = 'overtime:manage',
  OVERTIME_APPROVE = 'overtime:approve',
  OVERTIME_CREATE = 'overtime:create',

  // Dynamic Forms
  FORMS_MANAGE = 'forms:manage',
  FORMS_FILL = 'forms:fill',

  // Feed & Novedades
  FEED_PUBLISH = 'feed:publish',
  FEED_MANAGE = 'feed:manage',

  // Knowledge Base
  KNOWLEDGE_MANAGE = 'knowledge:manage',
  KNOWLEDGE_VIEW = 'knowledge:view',

  // Password Vault
  PASSWORD_VAULT_MANAGE = 'password_vault:manage',
  PASSWORD_VAULT_USE = 'password_vault:use',

  // Points & Rewards
  POINTS_MANAGE = 'points:manage',
  POINTS_APPROVE = 'points:approve',

  // Special modules / Integrations
  COTIZADOR_ACCESS = 'cotizador:access',
  ALERTA_RESERVAS_ACCESS = 'alerta_reservas:access',
  PAGO_TOTAL_ACCESS = 'pago_total:access',
}

export const ALL_PERMISSIONS: Permission[] = Object.values(Permission);

export const ROLE_DEFAULT_PERMISSIONS: Record<string, Permission[]> = {
  ADMIN: Object.values(Permission),
  MANAGER: [
    Permission.USERS_VIEW,
    Permission.LEAVES_APPROVE,
    Permission.OVERTIME_APPROVE,
    Permission.POINTS_APPROVE,
    Permission.KNOWLEDGE_MANAGE,
    Permission.FORMS_MANAGE,
    Permission.FEED_PUBLISH,
    Permission.EQUIPMENT_USE,
    Permission.LEAVES_CREATE,
    Permission.OVERTIME_CREATE,
    Permission.CESANTIAS_CREATE,
    Permission.FORMS_FILL,
    Permission.KNOWLEDGE_VIEW,
    Permission.PASSWORD_VAULT_USE,
  ],
  RRHH: [
    Permission.USERS_VIEW,
    Permission.USERS_MANAGE,
    Permission.LEAVES_MANAGE,
    Permission.LEAVES_APPROVE,
    Permission.CESANTIAS_MANAGE,
    Permission.FORMS_MANAGE,
    Permission.FEED_PUBLISH,
    Permission.KNOWLEDGE_MANAGE,
    Permission.EQUIPMENT_USE,
    Permission.LEAVES_CREATE,
    Permission.OVERTIME_CREATE,
    Permission.CESANTIAS_CREATE,
    Permission.FORMS_FILL,
    Permission.KNOWLEDGE_VIEW,
  ],
  LEADER: [
    Permission.USERS_VIEW,
    Permission.LEAVES_APPROVE,
    Permission.OVERTIME_APPROVE,
    Permission.POINTS_APPROVE,
    Permission.FEED_PUBLISH,
    Permission.KNOWLEDGE_VIEW,
    Permission.EQUIPMENT_USE,
    Permission.LEAVES_CREATE,
    Permission.OVERTIME_CREATE,
    Permission.CESANTIAS_CREATE,
    Permission.FORMS_FILL,
    Permission.PASSWORD_VAULT_USE,
  ],
  EMPLOYEE: [
    Permission.EQUIPMENT_USE,
    Permission.LEAVES_CREATE,
    Permission.OVERTIME_CREATE,
    Permission.CESANTIAS_CREATE,
    Permission.FORMS_FILL,
    Permission.KNOWLEDGE_VIEW,
    Permission.PASSWORD_VAULT_USE,
  ],
  ACCOUNTING: [
    Permission.USERS_VIEW,
    Permission.POINTS_APPROVE,
    Permission.FEED_PUBLISH,
    Permission.KNOWLEDGE_VIEW,
    Permission.EQUIPMENT_USE,
    Permission.LEAVES_CREATE,
    Permission.OVERTIME_CREATE,
    Permission.CESANTIAS_CREATE,
    Permission.FORMS_FILL,
    Permission.PASSWORD_VAULT_USE,
  ],
};

export interface UserLike {
  role?: string;
  isLeader?: boolean;
  permissions?: string[];
  customPermissions?: string[];
}

export function getEffectivePermissions(user: UserLike | null | undefined): string[] {
  if (!user || !user.role) return [];

  const roleUpper = String(user.role).trim().toUpperCase();

  if (roleUpper === 'ADMIN') {
    return Object.values(Permission);
  }

  // If backend already provided consolidated permissions list
  if (Array.isArray(user.permissions) && user.permissions.length > 0) {
    const combined = new Set<string>([...user.permissions, ...(user.customPermissions || [])]);
    return Array.from(combined);
  }

  const defaultPerms = ROLE_DEFAULT_PERMISSIONS[roleUpper] || [];
  const customPerms = (user.customPermissions || []) as Permission[];

  const combined = new Set<string>([...defaultPerms, ...customPerms]);
  return Array.from(combined);
}

export function hasPermission(
  user: UserLike | null | undefined,
  requiredPermission: Permission | string
): boolean {
  if (!user || !user.role) return false;

  const roleUpper = String(user.role).trim().toUpperCase();
  if (roleUpper === 'ADMIN') return true;

  const userPerms = getEffectivePermissions(user);
  return userPerms.includes(requiredPermission);
}

export function hasAnyPermission(
  user: UserLike | null | undefined,
  permissions: (Permission | string)[]
): boolean {
  if (!user) return false;
  return permissions.some((perm) => hasPermission(user, perm));
}

export function canApproveRequests(user: UserLike | null | undefined): boolean {
  if (!user) return false;

  const roleUpper = String(user.role || '').trim().toUpperCase();

  if (roleUpper === 'ADMIN' || roleUpper === 'MANAGER' || roleUpper === 'LEADER') {
    return true;
  }

  if (user.isLeader === true) {
    return true;
  }

  return (
    hasPermission(user, Permission.LEAVES_APPROVE) ||
    hasPermission(user, Permission.OVERTIME_APPROVE) ||
    hasPermission(user, Permission.POINTS_APPROVE)
  );
}
