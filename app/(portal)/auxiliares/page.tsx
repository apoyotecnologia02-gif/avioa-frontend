"use client";

import { useModulePermission } from "@/hooks/useModulePermission";
import "./auxiliary.css";
import Workspace from "@/components/auxiliary/Workspace";

export default function AuxiliaresPage() {
  const permissions = useModulePermission("AUXILIARY");
  if (!permissions.canAccess) return <p>No tienes acceso a Auxiliares.</p>;
  return <Workspace embedded permissions={permissions} />;
}
