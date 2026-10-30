"use client";

import { useState } from "react";
import {
  ExternalLink,
  Loader2,
  RefreshCw,
  Search,
  Table2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useModulePermission } from "@/hooks/useModulePermission";
import { commercialTables, type CommercialTable } from "@/lib/commercial-drive-tables";
import { TableSource } from "./TableSource";

interface DriveTablesProps {
  operators?: boolean;
}

type TabKey = CommercialTable | "alta2027";

export function DriveTables({ operators = false }: DriveTablesProps) {
  const permissions = useModulePermission("COMMERCIAL");
  const [tab, setTab] = useState<TabKey>("baja2026");

  if (!permissions.canAccess) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <p className="text-muted-foreground">
          No tienes acceso al módulo Comercial.
        </p>
      </div>
    );
  }

  const tabs: TabKey[] = [
    "baja2026",
    "alta2026",
    "baja2027",
    "alta2027",
    "navidad",
    "naio",
  ];

  return (
    <div className="flex w-full flex-col gap-4">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-semibold">
          <Table2 className="h-5 w-5" />
          {operators ? "Links de operadores" : "Tarifas y planes"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {operators
            ? "Accesos directos y contactos de los operadores."
            : "Tarifas, temporadas y planes del tarifario en Drive."}
        </p>
      </div>

      {!operators && (
        <nav
          role="tablist"
          aria-label="Tarifas, temporadas y planes"
          className="flex flex-wrap gap-1 rounded-lg border border-border bg-muted/30 p-1"
        >
          {tabs.map((k) => (
            <button
              key={k}
              type="button"
              role="tab"
              aria-selected={tab === k}
              onClick={() => setTab(k)}
              className={`rounded-md px-3 py-2 text-sm transition-colors ${
                tab === k
                  ? "bg-card font-semibold shadow-sm"
                  : "text-muted-foreground hover:bg-card/50"
              }`}
            >
              {k === "alta2027"
                ? "Alta 2027 · pendiente"
                : commercialTables[k as CommercialTable].title}
            </button>
          ))}
        </nav>
      )}

      {!operators && tab === "alta2027" ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border bg-muted/30 p-12 text-center">
          <Table2 className="h-8 w-8 text-muted-foreground" />
          <h3 className="text-sm font-semibold">
            Alta 2027 · pendiente
          </h3>
          <p className="max-w-md text-xs text-muted-foreground">
            La hoja ALTA 2027 todavía no existe en el archivo conectado. Se
            mostrará cuando esté disponible.
          </p>
        </div>
      ) : (
        <TableSource
          key={operators ? "operadores" : (tab as CommercialTable)}
          sourceKey={
            operators ? "operadores" : (tab as CommercialTable)
          }
        />
      )}
    </div>
  );
}