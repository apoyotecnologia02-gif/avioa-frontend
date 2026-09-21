import { APP_MODULES, AppModuleKey } from "./modules";

export type ModulePermission = {
  modulePermissionId: string;
  userId: string;
  module: string;
  canAccess: boolean;
  grantedBy?: string;
};

export interface UserWithModules {
  role?: string;
  modulePermissions?: ModulePermission[];
}

const ADMIN_ROLES = new Set(["ADMIN"]);

function isAdmin(user: UserWithModules) {
  return !!user.role && ADMIN_ROLES.has(user.role.trim().toUpperCase());
}

export function hasModuleAccess(
  user: UserWithModules | null | undefined,
  module: AppModuleKey,
): boolean {
  if (!user) return false;
  if (isAdmin(user)) return true;

  return (
    user.modulePermissions?.some(
      (p) => p.module === module && p.canAccess === true,
    ) ?? false
  );
}

export function hasAnyModuleAcces(
  user: UserWithModules | null | undefined,
  modules: AppModuleKey[],
): boolean {
  if (!user) return false;
  if (isAdmin(user)) return true;
  return modules.some((m) => hasModuleAccess(user, m));
}

export function getAccessibleModules(
  user: UserWithModules | null | undefined,
): AppModuleKey[] {
  if (!user) return [];
  if (isAdmin(user)) return APP_MODULES.map((m) => m.key);

  return (
    user.modulePermissions
      ?.filter((p) => p.canAccess)
      .map((p) => p.module as AppModuleKey) ?? []
  );
}
