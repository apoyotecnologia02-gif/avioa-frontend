"use client";

import { useModulePermission } from "@/hooks/useModulePermission";
import { OverviewHeader } from "./OverviewHeader";
import { OverviewStats } from "./OverviewStats";
import { OverviewQuickActions } from "./OverviewQuickActions";

export function CommercialOverview() {
  const permissions = useModulePermission("COMMERCIAL");

  if (!permissions.canAccess) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <p className="text-muted-foreground">
          No tienes acceso al módulo Comercial.
        </p>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <OverviewHeader />
      <OverviewStats />
      <OverviewQuickActions />
    </div>
  );
}