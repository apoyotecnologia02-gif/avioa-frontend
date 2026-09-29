"use client";

import { useState, useMemo } from "react";
import { Search, FileWarning, ChevronLeft, ChevronRight } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { useSolicitudesContabilidad } from "@/hooks/useNomina";
import {
  CATALOGO_ESTADO_SOLICITUD,
  CATALOGO_TIPO_NOVEDAD,
  claseEstado,
  colorPorAfectacion,
} from "@/lib/nomina/catalogos";
import type { FiltrosSolicitudes } from "@/types/nomina.types";
import { useDirectory } from "@/hooks/useDirectory";

export default function SolicitudesContabilidadPage() {
  const [userId, setUserId] = useState<string | undefined>();
  const [area, setArea] = useState<string | undefined>();
  const [tipos, setTipos] = useState<string[]>([]);
  const [estados, setEstados] = useState<string[]>([]);
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [page, setPage] = useState(1);

  const { data: colaboradores } = useDirectory();

  const filtros: FiltrosSolicitudes = useMemo(
    () => ({
      userId,
      area,
      tipos: tipos.length ? tipos : undefined,
      estados: estados.length ? estados : undefined,
      desde: desde || undefined,
      hasta: hasta || undefined,
      page,
      pageSize: 20,
    }),
    [userId, area, tipos, estados, desde, hasta, page],
  );

  const { data, isLoading } = useSolicitudesContabilidad(filtros);

  const toggleTipo = (tipo: string) => {
    setPage(1);
    setTipos((prev) =>
      prev.includes(tipo) ? prev.filter((t) => t !== tipo) : [...prev, tipo],
    );
  };

  const toggleEstado = (estado: string) => {
    setPage(1);
    setEstados((prev) =>
      prev.includes(estado)
        ? prev.filter((e) => e !== estado)
        : [...prev, estado],
    );
  };

  const areasUnicas = useMemo(() => {
    const set = new Set(colaboradores?.map((c: any) => c.area).filter(Boolean));
    return Array.from(set) as string[];
  }, [colaboradores]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          Solicitudes de ausencias y horas extra
        </h1>
        <p className="text-muted-foreground">
          Todas las solicitudes, en cualquier estado, con filtros combinables.
        </p>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="space-y-4 p-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Colaborador</Label>
              <Select
                value={userId ?? "todos"}
                onValueChange={(v) => {
                  setUserId(v === "todos" ? undefined : v);
                  setPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  {colaboradores?.map((c: any) => (
                    <SelectItem key={c.userId} value={c.userId}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Área</Label>
              <Select
                value={area ?? "todas"}
                onValueChange={(v) => {
                  setArea(v === "todas" ? undefined : v);
                  setPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas</SelectItem>
                  {areasUnicas.map((a) => (
                    <SelectItem key={a} value={a}>
                      {a}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Tipo</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start font-normal"
                  >
                    {tipos.length === 0
                      ? "Todos los tipos"
                      : `${tipos.length} seleccionado(s)`}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-2" align="start">
                  <div className="max-h-64 space-y-1 overflow-y-auto">
                    {CATALOGO_TIPO_NOVEDAD.map((t) => (
                      <label
                        key={t.value}
                        className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-accent"
                      >
                        <Checkbox
                          checked={tipos.includes(t.value)}
                          onCheckedChange={() => toggleTipo(t.value)}
                        />
                        {t.label}
                      </label>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Estado</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start font-normal"
                  >
                    {estados.length === 0
                      ? "Todos los estados"
                      : `${estados.length} seleccionado(s)`}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-2" align="start">
                  <div className="space-y-1">
                    {CATALOGO_ESTADO_SOLICITUD.map((e) => (
                      <label
                        key={e.value}
                        className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-accent"
                      >
                        <Checkbox
                          checked={estados.includes(e.value)}
                          onCheckedChange={() => toggleEstado(e.value)}
                        />
                        {e.label}
                      </label>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:w-fit">
            <div className="space-y-1.5">
              <Label className="text-xs">Desde (opcional)</Label>
              <Input
                type="date"
                value={desde}
                onChange={(e) => {
                  setDesde(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Hasta (opcional)</Label>
              <Input
                type="date"
                value={hasta}
                min={desde}
                onChange={(e) => {
                  setHasta(e.target.value);
                  setPage(1);
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-md" />
          ))}
        </div>
      ) : !data || data.data.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed py-16 text-center">
          <FileWarning className="h-10 w-10 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">
            No hay solicitudes con estos filtros.
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Colaborador</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fechas</TableHead>
                  <TableHead className="text-right">Cantidad</TableHead>
                  <TableHead className="text-right">Motivo</TableHead>
                  <TableHead>Área</TableHead>
                  <TableHead>Solicitada el</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.data.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>
                      <div className="font-medium">{s.nombreColaborador}</div>
                      <div className="text-xs text-muted-foreground">
                        {s.documentNumber ?? "—"}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{s.tipoLabel}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={claseEstado(s.status)}
                      >
                        {s.statusLabel}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(s.fechaInicio).toLocaleDateString("es-CO", {
                        day: "numeric",
                        month: "short",
                      })}
                      {s.fechaInicio !== s.fechaFin && (
                        <>
                          {" "}
                          –{" "}
                          {new Date(s.fechaFin).toLocaleDateString("es-CO", {
                            day: "numeric",
                            month: "short",
                          })}
                        </>
                      )}
                      {s.horaInicio && (
                        <div className="text-xs">
                          {s.horaInicio} – {s.horaFin}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {s.cantidad} {s.unidad === "HORAS" ? "h" : "d"}
                    </TableCell>
                    <TableCell className="max-w-[240px] whitespace-normal break-words text-right text-sm text-muted-foreground">
                      {s.motivo ?? "—"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {s.area ?? "—"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(s.fechaRegistro).toLocaleDateString("es-CO", {
                        day: "numeric",
                        month: "short",
                      })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {data.total} solicitud(es) · Página {data.page} de{" "}
              {data.totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= data.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
