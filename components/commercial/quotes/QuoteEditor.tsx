"use client";


import { Sparkles } from "lucide-react";
import { useModulePermission } from "@/hooks/useModulePermission";
import { AssistantChat } from "./AssistantChat";



export function QuoteEditor() {
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
        <h1 className="text-2xl font-semibold">Cotizaciones</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Prepara propuestas de viaje manualmente o consulta el tarifario con el
          asistente de IA.
        </p>
      </div>

      <nav className="flex gap-1 rounded-lg border border-border bg-muted/30 p-1">
        <p
          className={`flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm transition-colors`}
        >
          <Sparkles className="h-4 w-4" />
          Consultar tarifario
        </p>
      </nav>

      {<AssistantChat mode="quotes" />}
    </div>
  );
}