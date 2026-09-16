import { NovedadConsolidada } from "@/types/nomina.types";
import { Skeleton } from "../ui/skeleton";
import { FileText } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { CruceBadge } from "./CruceBadge";
import { Badge } from "../ui/badge";
import { colorPorAfectacion } from "@/lib/nomina/catalogos";

interface TablaConsolidadaProps {
  novedades?: NovedadConsolidada[];
  isLoading: boolean;
}

export function TablaConsolidada({
  novedades,
  isLoading,
}: TablaConsolidadaProps) {
  if (isLoading) {
    <div className="space-y-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full rounded-md" />
      ))}
    </div>;
  }

  if (!novedades || novedades.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed py-16 text-center">
        <FileText className="h-10 w-10 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">
          No hay novedades aprobadas en este periodo con los filtros actuales.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Colaborador</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Fechas en periodo</TableHead>
            <TableHead className="text-right">Cantidad</TableHead>
            <TableHead>Efecto</TableHead>
            <TableHead>Área / Razón Social</TableHead>
            <TableHead>Soporte</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {novedades.map((n) => (
            <TableRow key={n.id}>
              <TableCell>
                <div className="font-medium">{n.nombreColaborador}</div>
                <div className="text-xs text-muted-foreground">
                  {n.documentNumber ?? "-"}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-sm">{n.tipoLabel}</span>
                  <CruceBadge
                    cruzaAnterior={n.cruzaPeriodoAnterior}
                    cruzaSiguiente={n.cruzaPeriodoSiguiente}
                    fechaInicioReal={n.fechaInicio}
                    fechaFinReal={n.fechaFin}
                  />
                </div>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {new Date(n.fechaInicioEnPeriodo).toLocaleDateString("es-CO", {
                  day: "numeric",
                  month: "short",
                })}
                {" – "}
                {new Date(n.fechaFinEnPeriodo).toLocaleDateString("es-CO", {
                  day: "numeric",
                  month: "short",
                })}
              </TableCell>
              <TableCell className="text-right font-semibold">
                {n.cantidadEnPeriodo} {n.unidad === "HORAS" ? "h" : "d"}
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={colorPorAfectacion(n.afectaNomina)}
                >
                  {n.afectaNomina === "SUMA" ? "+ Suma" : "− Resta"}
                </Badge>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {n.area ?? "—"} · {n.legalEntity ?? "—"}
              </TableCell>
              <TableCell>
                {n.attachmentUrl ? (
                  <a
                    href={n.attachmentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline"
                  >
                    Ver
                  </a>
                ) : (
                  <span className="text-xs text-muted-foreground">—</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
