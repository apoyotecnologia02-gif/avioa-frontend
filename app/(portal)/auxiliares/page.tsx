"use client";
import { useModulePermission } from "@/hooks/useModulePermission";
import AuxiliaryDashboard from "@/components/auxiliary-operational/auxiliary-dashboard";
export default function Page() {
  const permission = useModulePermission("AUXILIARY");
  if (!permission.canAccess)
    return <p>No tienes acceso a Auxiliares operativos.</p>;
  return <AuxiliaryDashboard />;
}
