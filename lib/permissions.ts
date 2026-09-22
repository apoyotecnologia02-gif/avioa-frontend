import {
  APP_MODULES,
  type AppModuleAction,
  type AppModuleKey,
} from "./modules";

export type ModulePermission = {
  module: string;
  actions?: AppModuleAction[] | string[];
};

export interface UserWithModules {
  id?: string;
  userId?: string;
  role?: string;
  isLeader?: boolean;
  modulePermissions?: ModulePermission[];
}

const ADMIN_ROLES = new Set(["ADMIN"]);
const MODULE_ACTIONS: AppModuleAction[] = ["create", "update", "delete"];

function isAdmin(user: UserWithModules) {
  return !!user.role && ADMIN_ROLES.has(user.role.trim().toUpperCase());
}

function normalizeAction(action: string): AppModuleAction | null {
  const value = action.trim().toLowerCase();
  if (value === "create" || value === "update" || value === "delete") {
    return value;
  }
  return null;
}

function getPermissionEntry(
  user: UserWithModules,
  module: AppModuleKey,
): ModulePermission | undefined {
  return user.modulePermissions?.find((p) => p.module === module);
}

export function hasModuleAccess(
  user: UserWithModules | null | undefined,
  module: AppModuleKey,
): boolean {
  if (!user) return false;
  if (isAdmin(user)) return true;

  return user.modulePermissions?.some((p) => p.module === module) ?? false;
}

export function hasAnyModuleAccess(
  user: UserWithModules | null | undefined,
  modules: AppModuleKey[],
): boolean {
  if (!user) return false;
  if (isAdmin(user)) return true;
  return modules.some((m) => hasModuleAccess(user, m));
}

// Alias for backwards compatibility
export const hasAnyModuleAcces = hasAnyModuleAccess;

export function getAccessibleModules(
  user: UserWithModules | null | undefined,
): AppModuleKey[] {
  if (!user) return [];
  if (isAdmin(user)) return APP_MODULES.map((m) => m.key);

  return user.modulePermissions?.map((p) => p.module as AppModuleKey) ?? [];
}

export function getUserModuleActions(
  user: UserWithModules | null | undefined,
  module: AppModuleKey,
): AppModuleAction[] {
  if (!user) return [];
  if (isAdmin(user)) return [...MODULE_ACTIONS];
  if (!hasModuleAccess(user, module)) return [];

  const entry = getPermissionEntry(user, module);
  const unique = new Set<AppModuleAction>();
  for (const raw of entry?.actions ?? []) {
    const action = normalizeAction(raw);
    if (action) unique.add(action);
  }
  return MODULE_ACTIONS.filter((action) => unique.has(action));
}

export function hasModuleAction(
  user: UserWithModules | null | undefined,
  module: AppModuleKey,
  action: AppModuleAction,
): boolean {
  return getUserModuleActions(user, module).includes(action);
}
