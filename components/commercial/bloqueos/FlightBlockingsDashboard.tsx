"use client";

import {
  Plane,
  Calendar,
  AlertTriangle,
  Search,
  Plus,
  CheckCircle2,
  XCircle,
  UploadCloud,
  FileText,
  Banknote,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Hook y utilidades
import {
  useFlightBlockings,
  blockDestination,
  blockNights,
  inventoryInitial,
  isAdminBlock,
} from "@/hooks/useFlightBlockings";

import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

// Componentes hijos
import ReservationTable from "./ReservationTable";
import BlockEditor from "./BlockEditor";
import InventoryEditor from "./InventoryEditor";
import LinkEditor from "./LinkEditor";
import SplitEditor from "./SplitEditor";
import ManualReservationEditor from "./ManualReservationEditor";

export function FlightBlockingsDashboard({
  control = false,
}: {
  control?: boolean;
}) {
  const h = useFlightBlockings({ control });

  // === ESTADOS DE CARGA INICIAL ===
  if (h.loading && !h.board) {
    return (
      <div className="p-8 text-center text-muted-foreground animate-pulse">
        Cargando bloqueos desde Drive...
      </div>
    );
  }
  if (h.error && !h.board) {
    return (
      <div className="p-8 text-center text-destructive border border-destructive/20 bg-destructive/10 rounded-lg m-4">
        <AlertTriangle className="mx-auto h-8 w-8 mb-2" />
        <p>{h.error}</p>
        <Button variant="outline" onClick={() => h.load()} className="mt-4">
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto p-4 md:p-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {control ? "Administración de Bloqueos" : "Bloqueos JetSMART"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {control
              ? "Gestiona cupos, pagos y datos de reservas."
              : "Consulta disponibilidad de vuelos y cupos."}
          </p>
        </div>

        {control && (
          <Tabs
            value={h.tab}
            onValueChange={(v) => h.openSection(v as any)}
            className="w-full md:w-auto"
          >
            <TabsList className="grid grid-cols-5 w-full md:w-[600px]">
              <TabsTrigger value="reservations">Reservas</TabsTrigger>
              <TabsTrigger value="paymentAlerts">
                Pagos{" "}
                <Badge variant="secondary" className="ml-1">
                  {h.paymentAlerts.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="dataAlerts">
                Datos{" "}
                <Badge variant="secondary" className="ml-1">
                  {h.dataAlerts.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="history">Historial</TabsTrigger>
              <TabsTrigger value="setup">Origen</TabsTrigger>
            </TabsList>
          </Tabs>
        )}
      </div>

      {h.message && (
        <div className="p-3 bg-green-50 text-green-700 border border-green-200 rounded-md text-sm flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" /> {h.message}
        </div>
      )}
      {h.error && h.board && (
        <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-md text-sm flex items-center gap-2">
          <XCircle className="h-4 w-4" /> {h.error}
        </div>
      )}

      {/* ========================================================= */}
      {/* VISTA: INVENTARIO (Tarjetas de vuelos)                    */}
      {/* ========================================================= */}
      {h.tab === "inventory" && (
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center gap-4 bg-muted/30 p-3 rounded-lg border border-border">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar código, destino..."
                className="pl-9"
                value={h.filters.search}
                onChange={(e) => h.patchFilters({ search: e.target.value })}
              />
            </div>
            <Select
              value={h.filters.destination || "all"}
              onValueChange={(v) =>
                h.patchFilters({ destination: v === "all" ? "" : v })
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Destino" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los destinos</SelectItem>
                {h.destinations.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={h.filters.nights || "all"}
              onValueChange={(v) =>
                h.patchFilters({ nights: v === "all" ? "" : v })
              }
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Noches" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las noches</SelectItem>
                {h.nightOptions.map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n} noches
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="all-dates"
                checked={h.filters.allDates}
                onChange={(e) => h.patchFilters({ allDates: e.target.checked })}
                className="rounded border-gray-300"
              />
              <Label
                htmlFor="all-dates"
                className="text-sm font-normal cursor-pointer"
              >
                Ver históricos
              </Label>
            </div>
            {h.canEdit && (
              <Button size="sm" onClick={() => h.openBlockEditor()}>
                <Plus className="h-4 w-4 mr-2" /> Nuevo Bloqueo
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {h.blocks.map((b: any) => {
              const nights = blockNights(b);
              const initial = inventoryInitial(b);
              return (
                <Card
                  key={b.id}
                  className="overflow-hidden hover:border-primary/50 transition-colors flex flex-col"
                >
                  <CardHeader className="p-4 pb-2 bg-muted/20">
                    <div className="flex justify-between items-start">
                      <div>
                        <Badge variant="outline" className="mb-1">
                          {b.code}
                        </Badge>
                        <CardTitle className="text-lg leading-tight">
                          {blockDestination(b)}
                        </CardTitle>
                      </div>
                      {nights !== null && (
                        <Badge variant="secondary">{nights} noches</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-2 flex flex-col gap-4 flex-1">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground uppercase">
                          Ida
                        </span>
                        <span className="font-medium flex items-center gap-1">
                          <Calendar className="h-3 w-3" /> {b.departDate}{" "}
                          {b.departTime}
                        </span>
                      </div>
                      <Plane className="h-4 w-4 text-muted-foreground rotate-45" />
                      <div className="flex flex-col text-right">
                        <span className="text-xs text-muted-foreground uppercase">
                          Regreso
                        </span>
                        <span className="font-medium flex items-center gap-1 justify-end">
                          <Calendar className="h-3 w-3" /> {b.returnDate}{" "}
                          {b.returnTime}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 bg-muted/50 p-2 rounded-md text-center mt-auto">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-muted-foreground uppercase">
                          Contratados
                        </span>
                        <span className="font-semibold">{initial ?? "—"}</span>
                      </div>
                      <div className="flex flex-col border-x border-border/50">
                        <span className="text-[10px] text-muted-foreground uppercase">
                          Vendidos
                        </span>
                        <span className="font-semibold">{b.netSold}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-muted-foreground uppercase">
                          Disponibles
                        </span>
                        <span
                          className={`font-semibold ${b.oversold ? "text-destructive" : "text-primary"}`}
                        >
                          {b.available ?? "?"}
                        </span>
                      </div>
                    </div>
                    {b.drive && (
                      <div className="text-sm text-muted-foreground flex justify-between">
                        <span>Valor tiquetes:</span>
                        <span className="font-medium text-foreground">
                          {new Intl.NumberFormat("es-CO", {
                            style: "currency",
                            currency: "COP",
                            maximumFractionDigits: 0,
                          }).format(b.drive.price)}
                        </span>
                      </div>
                    )}
                    {h.canEdit && (
                      <div className="flex gap-2 mt-2">
                        {h.canAdmin && b.drive && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => h.openInventoryEditor(b)}
                          >
                            Editar cupos
                          </Button>
                        )}
                        <Button
                          variant="default"
                          size="sm"
                          className="flex-1"
                          onClick={() => h.openManual(b.id)}
                        >
                          <Plus className="h-3 w-3 mr-1" /> Reserva
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* VISTA: RESERVAS (Tabla)                                   */}
      {/* ========================================================= */}
      {h.tab === "reservations" && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-4 bg-muted/30 p-3 rounded-lg border border-border">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar AVI, pasajero, asesor..."
                className="pl-9"
                value={h.filters.search}
                onChange={(e) => h.patchFilters({ search: e.target.value })}
              />
            </div>
            <Select
              value={h.filters.inbox}
              onValueChange={(v: any) => h.patchFilters({ inbox: v })}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Estado de revisión" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">
                  Sin revisar ({h.reviewCounts.pending})
                </SelectItem>
                <SelectItem value="changed">
                  Cambios ({h.reviewCounts.changed})
                </SelectItem>
                <SelectItem value="reviewed">
                  Revisadas ({h.reviewCounts.reviewed})
                </SelectItem>
                <SelectItem value="all">
                  Todas ({h.reservationCount})
                </SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={h.filters.arrival}
              onValueChange={(v: any) => h.patchFilters({ arrival: v })}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Fecha de creación" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las fechas</SelectItem>
                <SelectItem value="after">
                  Posteriores a integración ({h.arrivalCounts.after})
                </SelectItem>
                <SelectItem value="before">
                  Anteriores a integración ({h.arrivalCounts.before})
                </SelectItem>
                <SelectItem value="manual">
                  Manuales ({h.arrivalCounts.manual})
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <ReservationTable
            services={h.visibleServices}
            blocks={h.board?.blocks || []}
            busy={h.busy}
            canEdit={h.canEdit}
            onLink={(s: any) => h.openServiceEditor("link", s)}
            onSplit={(s: any) => h.openServiceEditor("split", s)}
            onReview={(s: any) => h.reviewReservation(s)}
          />
        </div>
      )}

      {/* ========================================================= */}
      {/* VISTA: ALERTAS (Pagos y Datos)                            */}
      {/* ========================================================= */}
      {(h.tab === "paymentAlerts" || h.tab === "dataAlerts") && (
        <div className="flex flex-col gap-4">
          <div className="bg-muted/30 p-4 rounded-lg border border-border text-sm">
            <p className="font-medium mb-1">
              {h.tab === "paymentAlerts"
                ? "Pagos de bloqueos"
                : "Envío de datos de pasajeros"}
            </p>
            <p className="text-muted-foreground">
              {h.tab === "paymentAlerts"
                ? "Se activa 30 días antes de la salida. Adjunta el comprobante o confirma un pago anterior."
                : "Se activa 15 días antes de la salida. Adjunta el soporte del envío o confirma uno anterior."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {h.activeAlerts.map((a: any) => {
              const b = h.board?.blocks.find((x: any) => x.id === a.blockId);
              if (!b) return null;
              const files =
                h.board?.files.filter(
                  (f: any) => f.blockId === b.id && f.kind === a.kind,
                ) || [];

              return (
                <Card key={a.blockId + a.kind} className="flex flex-col">
                  <CardHeader className="p-4 pb-2">
                    <div className="flex justify-between items-start mb-2">
                      <Badge
                        variant={
                          a.due < (h.board?.today || "")
                            ? "destructive"
                            : "default"
                        }
                      >
                        {a.due < (h.board?.today || "")
                          ? "Vencida"
                          : "Vence hoy"}
                      </Badge>
                      {a.kind === "payment" ? (
                        <Banknote className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <Users className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <CardTitle className="text-base">
                      {b.code} · {b.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-2 flex-1 flex flex-col gap-3">
                    <div className="text-sm space-y-1">
                      <p className="flex justify-between">
                        <span className="text-muted-foreground">
                          Fecha límite:
                        </span>{" "}
                        <strong className="text-destructive">{a.due}</strong>
                      </p>
                      <p className="flex justify-between">
                        <span className="text-muted-foreground">Salida:</span>{" "}
                        <span>{b.departDate}</span>
                      </p>
                    </div>

                    {files.length > 0 && (
                      <div className="bg-muted/50 p-2 rounded-md space-y-1 mt-2">
                        {files.map((f: any) => (
                          <a
                            key={f.id}
                            href={`/api/flight-blockings/files?id=${f.id}`}
                            target="_blank"
                            className="text-xs text-primary flex items-center gap-1 hover:underline"
                          >
                            <FileText className="h-3 w-3" /> {f.name}
                          </a>
                        ))}
                      </div>
                    )}

                    {h.canEdit && (
                      <div className="mt-auto pt-4 space-y-2">
                        <Label
                          htmlFor={`file-${b.id}-${a.kind}`}
                          className="cursor-pointer"
                        >
                          <div className="flex items-center justify-center gap-2 border-2 border-dashed border-border hover:bg-muted/50 rounded-md p-3 text-sm text-muted-foreground transition-colors">
                            <UploadCloud className="h-4 w-4" /> Subir archivo
                            adjunto
                          </div>
                          <input
                            id={`file-${b.id}-${a.kind}`}
                            type="file"
                            className="hidden"
                            accept="image/*,.pdf"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) h.upload(file, b.id, a.kind);
                              e.target.value = "";
                            }}
                          />
                        </Label>
                        <Button
                          className="w-full"
                          variant={files.length > 0 ? "default" : "secondary"}
                          // AQUÍ ESTÁ LA CORRECCIÓN DEL ERROR:
                          disabled={
                            h.busy ||
                            (a.kind === "names" &&
                              isAdminBlock(b) &&
                              b.unresolved > 0)
                          }
                          onClick={() => h.completeTask(b as any, a.kind)}
                        >
                          {files.length > 0
                            ? "Marcar como completado"
                            : "Confirmar anterior y cerrar"}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {h.activeAlerts.length === 0 && (
            <div className="text-center py-16 bg-muted/20 border border-dashed rounded-lg">
              <CheckCircle2 className="mx-auto h-10 w-10 text-green-500/50 mb-3" />
              <h3 className="text-lg font-medium">Todo al día</h3>
              <p className="text-sm text-muted-foreground">
                No hay alertas pendientes para esta categoría.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* VISTA: HISTORIAL Y SETUP (Placeholders)                   */}
      {/* ========================================================= */}
      {/* ========================================================= */}
{/* VISTA: HISTORIAL                                         */}
{/* ========================================================= */}
{h.tab === 'history' && (
  <div className="flex flex-col gap-4">
    <div className="bg-muted/30 p-4 rounded-lg border border-border">
      <h2 className="text-lg font-semibold">Historial de gestiones</h2>
      <p className="text-sm text-muted-foreground">
        Últimos 250 movimientos realizados en los bloqueos. Los registros anteriores se conservan.
      </p>
    </div>

    <div className="rounded-lg border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Fecha</TableHead>
            <TableHead>Gestión</TableHead>
            <TableHead>Bloqueo / Servicio</TableHead>
            <TableHead>Responsable</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {h.board?.events.map((e: any) => {
            const block = h.board?.blocks.find((b: any) => b.id === e.blockId);
            return (
              <TableRow key={e.id}>
                <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                  {new Date(e.at).toLocaleString('es-CO')}
                </TableCell>
                <TableCell className="text-sm font-medium">{e.action}</TableCell>
                <TableCell className="text-sm">
                  {block ? `${block.code} · ${block.title}` : e.serviceId || '—'}
                </TableCell>
                <TableCell className="text-sm">{e.by}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      {(!h.board?.events || h.board.events.length === 0) && (
        <div className="p-8 text-center text-muted-foreground">No hay movimientos registrados aún.</div>
      )}
    </div>
  </div>
)}

{/* ========================================================= */}
{/* VISTA: SETUP (Origen de los bloqueos)                     */}
{/* ========================================================= */}
{h.tab === 'setup' && (
  <div className="flex flex-col gap-4">
    <div className="bg-muted/30 p-4 rounded-lg border border-border">
      <h2 className="text-lg font-semibold">Origen de los bloqueos</h2>
      <p className="text-sm text-muted-foreground">
        Los bloqueos se cargan automáticamente desde la hoja de Google Sheets y se sincronizan con Travel Compositor.
      </p>
    </div>

    <Card>
      <CardHeader>
        <CardTitle className="text-base">Conexión con Google Drive</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p><strong>Saldo inicial cargado de Drive:</strong> Sí</p>
        <p><strong>Última verificación:</strong> {h.board?.drive?.checkedAt ? new Date(h.board.drive.checkedAt).toLocaleString('es-CO') : 'Pendiente'}</p>
        {h.board?.drive?.error && (
          <p className="text-destructive">Error de Drive: {h.board.drive.error}</p>
        )}
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle className="text-base">Sincronización con Travel Compositor</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p><strong>Estado:</strong> {h.board?.sync?.configured ? 'Conectado' : 'No configurado'}</p>
        <p><strong>Última sincronización exitosa:</strong> {h.board?.sync?.lastSuccess ? new Date(h.board.sync.lastSuccess).toLocaleString('es-CO') : 'Pendiente'}</p>
        {h.board?.sync?.error && (
          <p className="text-destructive">Error de TC: {h.board.sync.error}</p>
        )}
      </CardContent>
    </Card>
  </div>
)}

      {/* ========================================================= */}
      {/* MODALES (Editores)                                        */}
      {/* ========================================================= */}

      {h.editor.kind === "block" && (
        <BlockEditor
          open={true}
          data={h.editor.data}
          capacityText={h.editor.capacityText}
          aliasesText={h.editor.aliasesText}
          onChange={h.updateBlockDraft}
          onFieldsChange={h.updateBlockFields}
          onSave={h.submitBlockEditor}
          onCancel={h.closeEditor}
          busy={h.busy}
          error={h.error}
        />
      )}

      {h.editor.kind === "inventory" && (
        <InventoryEditor
          open={true}
          data={h.editor.data}
          draft={h.editor.draft}
          onChange={h.updateInventoryDraft}
          onSave={h.submitInventoryEditor}
          onCancel={h.closeEditor}
          busy={h.busy}
          error={h.error}
        />
      )}

      {h.editor.kind === "link" && (
        <LinkEditor
          open={true}
          service={h.editor.service}
          blocks={h.blocks}
          draft={h.editor.draft}
          onChange={h.updateLinkDraft}
          onSave={(blockId, seats) => {
            const editor = h.editor;
            if (editor.kind !== "link") return;
            return h.linkReservation(editor.service, blockId, seats);
          }}
          onCancel={h.closeEditor}
          busy={h.busy}
          error={h.error}
        />
      )}

      {h.editor.kind === "split" && (
        <SplitEditor
          open={true}
          service={h.editor.service}
          rows={h.editor.rows}
          onRowsChange={h.updateSplitRows}
          onSave={(rows) => {
            const editor = h.editor;
            if (editor.kind !== "split") return;
            return h.splitReservation(editor.service, rows);
          }}
          onCancel={h.closeEditor}
          busy={h.busy}
        />
      )}

      {h.editor.kind === "manual" && (
        <ManualReservationEditor
          open={true}
          blocks={h.blocks}
          initialBlockId={h.editor.blockId}
          draft={h.editor.draft}
          onChange={h.updateManualDraft}
          onSave={h.addManualReservation}
          onCancel={h.closeEditor}
          busy={h.busy}
          error={h.error}
        />
      )}
    </div>
  );
}
