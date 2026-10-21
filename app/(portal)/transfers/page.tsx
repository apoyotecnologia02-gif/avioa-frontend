"use client";

import TransfersApp from "@/components/transfers/TransfersApp";
import { useAuth } from "@/hooks/useAuth";
import { hasModuleAccess } from "@/lib/permissions";

export default function TransfersPage() {
  const { user } = useAuth();
  const userName = user?.name || user?.email || "Usuario";
  return (
    <TransfersApp
      userName={userName}
      canManageProviders={hasModuleAccess(user, "TRANSFERS_PROVIDERS")}
      canManageConnections={hasModuleAccess(user, "TRANSFERS_CONNECTIONS")}
    />
  );
}
