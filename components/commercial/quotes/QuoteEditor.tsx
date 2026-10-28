"use client";

import { useState } from "react";
import { FileText, Sparkles } from "lucide-react";
import { useModulePermission } from "@/hooks/useModulePermission";
import { QuoteForm } from "./QuoteForm";
import { AssistantChat } from "./AssistantChat";

type Tab = "manual" | "ai";

export function QuoteEditor() {
  const permissions = useModulePermission("COMMERCIAL");
  const [tab, setTab] = useState<Tab>("manual");

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
        <button
          type="button"
          aria-pressed={tab === "manual"}
          onClick={() => setTab("manual")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm transition-colors ${
            tab === "manual"
              ? "bg-card font-semibold shadow-sm"
              : "text-muted-foreground hover:bg-card/50"
          }`}
        >
          <FileText className="h-4 w-4" />
          Preparar propuesta
        </button>
        <button
          type="button"
          aria-pressed={tab === "ai"}
          onClick={() => setTab("ai")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm transition-colors ${
            tab === "ai"
              ? "bg-card font-semibold shadow-sm"
              : "text-muted-foreground hover:bg-card/50"
          }`}
        >
          <Sparkles className="h-4 w-4" />
          Consultar tarifario
        </button>
      </nav>

      {tab === "manual" ? <QuoteForm /> : <AssistantChat mode="quotes" />}
    </div>
  );
}