"use client";

import { useFlightFilters } from "@/hooks/useFlightFilters";
import { FiltrosVuelos } from "@/types/vuelos.types";
import { Badge } from "../ui/badge";
import { X } from "lucide-react";
import { Button } from "../ui/button";

const LABELS: Record<keyof FiltrosVuelos, (v: any) => string> = {
  origen: (v) => `Origen: ${v}`,
  destino: (v) => `Destino: ${v}`,
  aerolinea: (v) => `Aerolínea: ${v}`,
  solo_gangas: () => "Solo gangas",
  precio_min: (v) => `Mín: $${Number(v).toLocaleString("es-CO")}`,
  precio_max: (v) => `Máx: $${Number(v).toLocaleString("es-CO")}`,
  max_escalas: (v) =>
    v === 0 ? "Directo" : `Máx. ${v} escala${v > 1 ? "s" : ""}`,
  fecha_ida_desde: (v) => `Desde: ${v}`,
  fecha_ida_hasta: (v) => `Hasta: ${v}`,
  horas: (v) => `Últimas ${v} h`,
  limit: () => "",
};

export function FilterChips() {
  const { filters, removeFilter, clearAll, activeCount } = useFlightFilters();

  if (activeCount === 0) return null;

  const active = (Object.keys(filters) as (keyof FiltrosVuelos)[]).filter(
    (k) => k !== "limit" && filters[k] !== undefined,
  );

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      {active.map((k) => (
        <Badge
          key={k}
          variant="secondary"
          className="gap-1 rounded-full pl-3 pr-1.5 py-1 text-xs"
        >
          {LABELS[k](filters[k])}
          <button
            onClick={() => removeFilter(k)}
            className="rounded-full p-0.5 hover:bg-muted-foreground/20"
            aria-label={`Quitar filtro ${LABELS[k](filters[k])}`}
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
      <Button
        variant="ghost"
        size="sm"
        onClick={clearAll}
        className="h-7 text-xs text-muted-foreground"
      >
        Limpiar todo
      </Button>
    </div>
  );
}
