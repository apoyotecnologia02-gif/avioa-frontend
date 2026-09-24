import { ResumenColaborador } from "@/types/nomina.types";
import { useState } from "react";
import { Skeleton } from "../ui/skeleton";
import { Card, CardContent } from "../ui/card";
import {
  ChevronDown,
  ChevronUp,
  Clock,
  FileWarning,
  Umbrella,
} from "lucide-react";
import { Badge } from "../ui/badge";
import { CruceBadge } from "./CruceBadge";
import { colorPorAfectacion } from "@/lib/nomina/catalogos";

interface ListaPorColaboradorProps {
  resumenes?: ResumenColaborador[];
  isLoading: boolean;
}

export function ListaPorColaborador({
  resumenes,
  isLoading,
}: ListaPorColaboradorProps) {
  const [expandido, setExpandido] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (!resumenes || resumenes.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed py-16 text-center">
        <p className="text-sm text-muted-foreground">
          No hay novedades en este periodo.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {resumenes.map((r) => {
        const abierto = expandido === r.userId;
        return (
          <Card key={r.userId}>
            <button
              className="flex w-full items-center justify-between gap-3 p-4 text-left"
              onClick={() => setExpandido(abierto ? null : r.userId)}
            >
              <div className="min-w-0 flex-1">
                <p className="font-medium">{r.nombreColaborador}</p>
                <p className="text-xs text-muted-foreground">
                  {r.position ?? "-"} · {r.area ?? "-"} ·{" "}
                  {r.documentNumber ?? "-"}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-4 text-sm">
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Umbrella className="h-3.5 w-3.5" /> {r.totalDiasVacaciones}d
                </span>
                <span className="flex items-center gap-1 text-muted-foreground">
                  <FileWarning className="h-3.5 w-3.5" /> {r.totalDiasAusencia}d
                </span>
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" /> {r.totalHorasExtra}h
                </span>
                {r.diasNoRemunerados > 0 && (
                  <Badge
                    variant="outline"
                    className="bg-amber-100 text-amber-700"
                  >
                    {r.diasNoRemunerados}d no remunerados
                  </Badge>
                )}
                {abierto ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </div>
            </button>

            {abierto && (
              <CardContent className="space-y-2 border-t pt-3">
                {r.novedades.map((n) => (
                  <div
                    key={n.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-muted/40 px-3 py-2 text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{n.tipoLabel}</span>
                      {n.esCompensada && (
                        <Badge
                          variant="outline"
                          className="border-dashed border-sky-500/60 bg-sky-50 text-[10px] text-sky-700 dark:bg-sky-900/20 dark:text-sky-300"
                        >
                          Compensada
                        </Badge>
                      )}
                      {n.esParcial && (
                        <Badge
                          variant="outline"
                          className="border-purple-500/60 bg-purple-50 text-[10px] text-purple-700 dark:bg-purple-900/20 dark:text-purple-300"
                        >
                          Parcial
                        </Badge>
                      )}
                      <CruceBadge
                        cruzaAnterior={n.cruzaPeriodoAnterior}
                        cruzaSiguiente={n.cruzaPeriodoSiguiente}
                        fechaInicioReal={n.fechaInicio}
                        fechaFinReal={n.fechaFin}
                      />
                    </div>
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <span>
                        {new Date(
                          `${n.fechaInicioEnPeriodo}T00:00:00`,
                        ).toLocaleDateString("es-CO", {
                          day: "numeric",
                          month: "short",
                        })}
                        {" – "}
                        {new Date(
                          `${n.fechaFinEnPeriodo}T00:00:00`,
                        ).toLocaleDateString("es-CO", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                      <div className="flex flex-col items-end">
                        <span className="font-semibold text-foreground">
                          {n.cantidadEnPeriodo}{" "}
                          {n.unidad === "HORAS" ? "h" : "d"}
                        </span>
                        {n.esParcial && n.horaInicio && n.horaFin && (
                          <span className="text-xs text-muted-foreground">
                            {n.horaInicio} – {n.horaFin}
                            {n.totalHoras !== null && ` · ${n.totalHoras} h`}
                          </span>
                        )}
                      </div>
                      <Badge
                        variant="outline"
                        className={colorPorAfectacion(n.afectaNomina)}
                      >
                        {n.afectaNomina === "SUMA" ? "+" : "−"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}
