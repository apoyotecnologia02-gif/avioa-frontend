"use client";

import { ListaPorColaborador } from "@/components/nomina/ListaPorColaborador";
import { TablaConsolidada } from "@/components/nomina/TablaConsolidada";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetUsers } from "@/hooks/useGetUsers";
import {
  useExportarNominaExcel,
  useNovedadesConsolidadas,
  useResumenPorColaborador,
  useTotalesNomina,
} from "@/hooks/useNomina";
import { CATALOGO_TIPO_NOVEDAD } from "@/lib/nomina/catalogos";
import { FiltrosNomina, TipoNovedad } from "@/types/nomina.types";
import {
  AlertTriangle,
  CalendarRange,
  Clock,
  FileSpreadsheet,
  FileWarning,
  LayoutList,
  Loader2,
  Umbrella,
  Users,
  UserSquare2,
} from "lucide-react";
import React, { useMemo, useState } from "react";

function primerYUltimoDiaDelMes() {
  const hoy = new Date();
  const primero = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
  const ultimo = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  return { desde: fmt(primero), hasta: fmt(ultimo) };
}

export default function NominaPage() {
  const [rango, setRango] = useState(primerYUltimoDiaDelMes());
  const [userId, setUserId] = useState<string | undefined>();
  // const [tipos, setTipos] = useState<TipoNovedad[]>([]);
  const [tipos, setTipos] = useState<TipoNovedad[]>(() =>
    CATALOGO_TIPO_NOVEDAD.map((t) => t.value),
  );
  const [vista, setVista] = useState<"consolidado" | "por-colaborador">(
    "consolidado",
  );

  const [filtroCompensada, setFiltroCompensada] = useState<
    "todas" | "solo" | "excluir"
  >("todas");

  const filtros: FiltrosNomina = useMemo(
    () => ({
      desde: rango.desde,
      hasta: rango.hasta,
      userId,
      tipos: tipos.length ? tipos : undefined,
      esCompensada:
        filtroCompensada === "todas" ? undefined : filtroCompensada === "solo",
    }),
    [rango, userId, tipos, filtroCompensada],
  );

  const { data: totales, isLoading: loadingTotales } =
    useTotalesNomina(filtros);
  const { data: novedades, isLoading: loadingNovedades } =
    useNovedadesConsolidadas(filtros, vista === "consolidado");

  const { data: porColaborador, isLoading: loadingPorColaborador } =
    useResumenPorColaborador(filtros, vista === "por-colaborador");

  const { exportar, isExporting } = useExportarNominaExcel();

  const { data: colaboradores } = useGetUsers();

  const toggleTipo = (tipo: TipoNovedad) => {
    setTipos((prev) =>
      prev.includes(tipo) ? prev.filter((t) => t !== tipo) : [...prev, tipo],
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Contabilidad · Novedades de nómina
          </h1>
          <p className="text-muted-foreground">
            Vacaciones, ausencias y horas extra aprobadas.
          </p>
        </div>

        <Button
          onClick={() => exportar(filtros)}
          disabled={isExporting}
          className="gap-2"
        >
          {isExporting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <FileSpreadsheet className="h-4 w-4" />
          )}
          {isExporting ? "Generando..." : "Exportar a Excel"}
        </Button>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-4 p-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-xs">
                <CalendarRange className="h-3.5 w-3.5" /> Desde
              </Label>
              <Input
                type="date"
                value={rango.desde}
                onChange={(e) =>
                  setRango((r) => ({ ...r, desde: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-xs">
                <CalendarRange className="h-3.5 w-3.5" /> Hasta
              </Label>
              <Input
                type="date"
                value={rango.hasta}
                min={rango.desde}
                onChange={(e) =>
                  setRango((r) => ({ ...r, hasta: e.target.value }))
                }
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Colaborador</Label>
              <Select
                value={userId ?? "todos"}
                onValueChange={(v) => setUserId(v === "todos" ? undefined : v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los colaboradores</SelectItem>
                  {colaboradores?.map((c: any) => (
                    <SelectItem key={c.userId} value={c.userId}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Tipo de novedad</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start font-normal"
                  >
                    {tipos.length === CATALOGO_TIPO_NOVEDAD.length
                      ? "Todos los tipos"
                      : tipos.length === 0
                        ? "Ningún tipo"
                        : `${tipos.length} tipo(s) seleccionados`}
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
              <Label className="text-xs">Vacaciones compensadas</Label>
              <Select
                value={filtroCompensada}
                onValueChange={(v) =>
                  setFiltroCompensada(v as typeof filtroCompensada)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas</SelectItem>
                  <SelectItem value="solo">Solo compensadas</SelectItem>
                  <SelectItem value="excluir">Sin compensadas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Periodo:{" "}
            {new Date(rango.desde + "T00:00:00").toLocaleDateString("es-CO", {
              day: "numeric",
              month: "long",
            })}
            {" – "}
            {new Date(rango.hasta + "T00:00:00").toLocaleDateString("es-CO", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <TarjetaResumen
          icon={Users}
          label="Colaboradores"
          valor={totales?.colaboradoresAfectados}
          loading={loadingTotales}
        />
        <TarjetaResumen
          icon={LayoutList}
          label="Novedades"
          valor={totales?.totalNovedades}
          loading={loadingTotales}
        />
        <TarjetaResumen
          icon={Umbrella}
          label="Días vacaciones"
          valor={totales?.totalDiasVacaciones}
          loading={loadingTotales}
        />
        <TarjetaResumen
          icon={FileWarning}
          label="Días ausencia"
          valor={totales?.totalDiasAusencia}
          loading={loadingTotales}
        />
        <TarjetaResumen
          icon={Clock}
          label="Horas extra"
          valor={totales?.totalHorasExtra}
          loading={loadingTotales}
        />
        <TarjetaResumen
          icon={AlertTriangle}
          label="Sin soporte"
          valor={totales?.sinSoporte}
          loading={loadingTotales}
          destacar={!!totales?.sinSoporte}
        />
      </div>

      <Tabs value={vista} onValueChange={(v) => setVista(v as typeof vista)}>
        <TabsList>
          <TabsTrigger value="consolidado" className="gap-1.5">
            <LayoutList className="h-4 w-4" /> Vista consolidada
          </TabsTrigger>
          <TabsTrigger value="por-colaborador" className="gap-1.5">
            <UserSquare2 className="h-4 w-4" /> Por colaborador
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {vista === "consolidado" ? (
        <TablaConsolidada novedades={novedades} isLoading={loadingNovedades} />
      ) : (
        <ListaPorColaborador
          resumenes={porColaborador}
          isLoading={loadingPorColaborador}
        />
      )}
    </div>
  );
}

function TarjetaResumen({
  icon: Icon,
  label,
  valor,
  loading,
  destacar,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  valor?: number;
  loading: boolean;
  destacar?: boolean;
}) {
  return (
    <Card
      className={
        destacar && valor ? "border-amber-300 bg-amber-50/50" : undefined
      }
    >
      <CardContent className="flex flex-col gap-1 p-3.5">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Icon className="h-3.5 w-3.5" />
          {label}
        </div>
        {loading ? (
          <Skeleton className="h-6 w-12" />
        ) : (
          <span
            className={`text-xl font-semibold ${destacar && valor ? "text-amber-700" : ""}`}
          >
            {valor ?? 0}
          </span>
        )}
      </CardContent>
    </Card>
  );
}
