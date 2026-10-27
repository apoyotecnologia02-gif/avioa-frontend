"use client";

import { Sparkles } from "lucide-react";

export function OverviewHeader() {
  return (
    <div>
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        <Sparkles className="h-3.5 w-3.5" />
        Espacio Comercial
      </div>
      <h1 className="mt-2 text-2xl font-semibold">
        Resumen del equipo comercial
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Ofertas, respuestas, documentos y recursos del equipo en un solo lugar.
      </p>
    </div>
  );
}