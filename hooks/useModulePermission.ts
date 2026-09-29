"use client";

import { hasModuleAccess, hasModuleAction } from "@/lib/permissions";
import type { AppModuleAction, AppModuleKey } from "@/lib/modules";
import { useAuthStore } from "@/store/authStore";

export function useModulePermission(module: AppModuleKey) {
  const user = useAuthStore((state) => state.user);

  return {
    canAccess: hasModuleAccess(user, module),
    canCreate: hasModuleAction(user, module, "create"),
    canUpdate: hasModuleAction(user, module, "update"),
    canDelete: hasModuleAction(user, module, "delete"),
    hasAction: (action: AppModuleAction) =>
      hasModuleAction(user, module, action),
  };
}
