"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { useModulePermission } from "@/hooks/useModulePermission";
import { AssistantChat } from "../quotes/AssistantChat";


export function EmailComposer() {
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
    <div className="flex w-full flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold">Asistente de correos</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Prepara borradores manualmente o genera una plantilla con el asistente
          de IA.
        </p>
      </div>

      <nav className="flex gap-1 rounded-lg border border-border bg-muted/30 p-1">
        <p
          className={`flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm transition-colors`}
        >
          <Sparkles className="h-4 w-4" />
          Asistente IA
        </p>
      </nav>

        <AssistantChat mode="email" />
    </div>
  );
}