"use client";

import {
  Hotel,
  Bus,
  Plane,
  MessagesSquare,
  ScanText,
  Mail,
  ArrowUpRight,
  ArrowRight,
  Route,
  Files,
  CheckCircle2,
  RefreshCw,
  Download,
  Pencil,
  Archive,
  RotateCcw,
  FolderOpen,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { AuxiliaryRecord, AuxiliaryPermissions } from "@/types/auxiliary";
import type { View } from "./Workspace";
import { kindLabels } from "./Workspace";
import {
  auxiliaryPdfUrl,
  downloadAuxiliaryPdf,
} from "@/lib/auxiliary/auxiliar-repository";

const statusLabels = {
  ready: "Revisado",
  pending: "Pendiente de envío",
  manual: "Envío manual registrado",
  confirmed: "Confirmado · registro manual",
};

const STATS = [
  { kind: "hotel", label: "Vouchers de hotel", Icon: Hotel },
  { kind: "request", label: "Solicitudes de traslado", Icon: Bus },
  { kind: "flight", label: "Itinerarios de vuelo", Icon: Plane },
  { kind: "reply", label: "Respuestas del equipo", Icon: MessagesSquare },
] as const;

const TOOLS = [
  {
    key: "hotel" as const,
    title: "Documentación hotelera",
    description: "Prepara el voucher con sus fechas, pasajeros y condiciones.",
    Icon: Hotel,
  },
  {
    key: "request" as const,
    title: "Traslados bien coordinados",
    description: "Organiza la solicitud y el mensaje para tu operador.",
    Icon: Bus,
  },
  {
    key: "flight" as const,
    title: "El vuelo, en sus manos",
    description: "Reúne las imágenes del itinerario en un solo PDF.",
    Icon: Plane,
  },
] as const;

const RESOURCES = [
  {
    key: "passengers" as const,
    title: "Los datos, bien escritos",
    text: "Revisa y organiza los nombres de tus pasajeros.",
    Icon: ScanText,
  },
  {
    key: "transfer" as const,
    title: "Todo listo al llegar",
    text: "Vouchers de traslados y plantillas de operadores.",
    Icon: Bus,
  },
  {
    key: "reply" as const,
    title: "Una respuesta a tiempo",
    text: "Tus mensajes frecuentes, fáciles de encontrar.",
    Icon: MessagesSquare,
  },
  {
    key: "email" as const,
    title: "Correos con claridad",
    text: "Prepara el mensaje y revísalo antes de enviarlo.",
    Icon: Mail,
  },
] as const;

interface Props {
  rows: AuxiliaryRecord[];
  loading: boolean;
  permissions: AuxiliaryPermissions;
  onNavigate: (view: View) => void;
  onOpen: (row: AuxiliaryRecord) => void;
  onArchive: (row: AuxiliaryRecord) => void;
  onRefresh: () => void;
}

export function Overview({
  rows,
  loading,
  permissions,
  onNavigate,
  onOpen,
  onArchive,
  onRefresh,
}: Props) {
  const active = rows.filter((r) => !r.archivedAt);

  return (
    <div className="space-y-8">
      {/* HERO */}
      <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-0 text-white shadow-lg dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="relative z-10 max-w-[64%] space-y-4 p-8 md:p-10">
          <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-primary-foreground/70">
            <span className="h-1 w-1 rounded-full bg-primary" />
            Detrás de cada gran viaje
          </p>
          <h2 className="text-3xl font-medium leading-tight tracking-tight md:text-4xl">
            Tu gestión hace
            <br />
            que todo encaje.
          </h2>
          <p className="max-w-md text-sm leading-relaxed text-slate-300">
            Pasajeros, vouchers e itinerarios. Un espacio para preparar el viaje
            con cada detalle en su lugar.
          </p>
          <Button
            onClick={() => onNavigate("hotel")}
            className="gap-2 bg-white text-slate-800 hover:bg-white/90"
          >
            Preparar un voucher <ArrowUpRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Arte decorativo */}
        <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[45%] md:block">
          <div className="absolute right-10 top-1/4 h-48 w-48 rounded-full border border-primary/20" />
          <div className="absolute right-6 top-1/3 h-40 w-40 rounded-full border border-dashed border-primary/20" />
          <Route
            className="absolute right-16 top-1/3 text-primary-foreground/20"
            size={130}
            strokeWidth={0.7}
          />
          <Files
            className="absolute right-36 top-20 text-primary-foreground/30"
            size={60}
            strokeWidth={1}
          />
          <div className="absolute right-24 top-1/2 flex items-center gap-2 rounded-md bg-white/90 px-2.5 py-1.5 text-[10px] text-slate-700 shadow-lg">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            Documentos listos
          </div>
        </div>
      </Card>

      {/* STATS */}
      {loading ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {STATS.map(({ kind, label, Icon }) => {
            const count = active.filter((r) => r.kind === kind).length;
            return (
              <Card
                key={kind}
                onClick={() => onNavigate(kind)}
                className="cursor-pointer p-4 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
              >
                <Icon className="mb-2 h-5 w-5 text-primary" />
                <p className="text-2xl font-medium text-foreground">
                  {count.toString().padStart(2, "0")}
                </p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </Card>
            );
          })}
        </div>
      )}

      {/* WORKFLOW */}
      <section>
        <div className="mb-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            De la reserva al viaje
          </p>
          <h3 className="mt-1 text-xl font-semibold tracking-tight">
            El siguiente paso, a mano
          </h3>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {TOOLS.map(({ key, title, description, Icon }, i) => (
            <Card
              key={key}
              onClick={() => onNavigate(key)}
              className="group cursor-pointer p-5 text-left transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
            >
              <div className="mb-4 flex items-center justify-between text-xs text-muted-foreground">
                <span>0{i + 1}</span>
                <Icon className="h-6 w-6 text-primary" />
              </div>
              <h4 className="mb-1.5 text-sm font-semibold leading-snug">
                {title}
              </h4>
              <p className="mb-4 text-xs leading-relaxed text-muted-foreground">
                {description}
              </p>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary group-hover:gap-2 transition-all">
                Empezar <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </Card>
          ))}
        </div>
      </section>

      {/* RESOURCES */}
      <section>
        <div className="mb-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            La base de un buen servicio
          </p>
          <h3 className="mt-1 text-xl font-semibold tracking-tight">
            Recursos para cada gestión
          </h3>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {RESOURCES.map(({ key, title, text, Icon }) => (
            <Card
              key={key}
              onClick={() => onNavigate(key)}
              className="group cursor-pointer p-5 text-left transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
            >
              <Icon className="mb-4 h-6 w-6 text-primary" />
              <h4 className="mb-1.5 text-sm font-semibold leading-snug">
                {title}
              </h4>
              <p className="mb-3 text-xs leading-relaxed text-muted-foreground">
                {text}
              </p>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary group-hover:gap-2 transition-all">
                Explorar <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </Card>
          ))}
        </div>
      </section>

      {/* ACTIVIDAD RECIENTE */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-semibold tracking-tight">
            Tu actividad reciente
          </h3>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              disabled={loading}
              className="gap-1.5 text-muted-foreground"
            >
              <RefreshCw
                className={cn("h-3.5 w-3.5", loading && "animate-spin")}
              />
              Actualizar
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate("history")}
              className="gap-1 text-primary hover:bg-primary/10 hover:text-primary"
            >
              Ver todo <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {active.length > 0 ? (
          <RecentTable
            rows={active.slice(0, 4)}
            onOpen={onOpen}
            onArchive={onArchive}
            permissions={permissions}
          />
        ) : (
          <Card className="flex flex-col items-center gap-3 border-dashed p-10 text-center">
            <FolderOpen className="h-8 w-8 text-muted-foreground/60" />
            <div>
              <p className="text-sm font-medium text-foreground">
                Un espacio listo para acompañarte
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Tus documentos aparecerán aquí cuando guardes el primero.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => onNavigate("hotel")}
              className="gap-1.5"
            >
              <Plus className="h-4 w-4" /> Crear voucher de hotel
            </Button>
          </Card>
        )}
      </section>
    </div>
  );
}

function RecentTable({
  rows,
  onOpen,
  onArchive,
  permissions,
}: {
  rows: AuxiliaryRecord[];
  onOpen: (r: AuxiliaryRecord) => void;
  onArchive: (r: AuxiliaryRecord) => void;
  permissions: AuxiliaryPermissions;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/40">
            <tr className="text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3">Reserva / Referencia</th>
              <th className="px-4 py-3">Documento</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.auxiliaryRecordId}
                className="border-t border-border"
              >
                <td className="px-4 py-3">
                  <p className="font-semibold text-foreground">
                    {row.reference}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    Versión {row.revision}
                  </p>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {kindLabels[row.kind]}
                </td>
                <td className="px-4 py-3">
                  <Badge
                    variant={row.state === "pending" ? "outline" : "secondary"}
                    className={
                      row.state === "pending"
                        ? "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
                        : "bg-primary/10 text-primary"
                    }
                  >
                    {row.archivedAt ? "Archivado" : statusLabels[row.state]}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    {!row.archivedAt && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-primary"
                          onClick={() => onOpen(row)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-primary"
                          onClick={() =>
                            downloadAuxiliaryPdf(
                              row.auxiliaryRecordId,
                              `avioa-${row.reference}.pdf`,
                            )
                          }
                          disabled={!row.auxiliaryRecordId}
                        >
                          <Download className="h-3.5 w-3.5" />
                        </Button>
                      </>
                    )}
                    {permissions.canDelete && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-primary"
                        onClick={() => onArchive(row)}
                      >
                        {row.archivedAt ? (
                          <RotateCcw className="h-3.5 w-3.5" />
                        ) : (
                          <Archive className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
