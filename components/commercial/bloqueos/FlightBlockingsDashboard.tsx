"use client";

import React, { useState } from "react";
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
  RotateCcw,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
// Hook y utilidades
import {
  useFlightBlockings,
  blockDestination,
  blockNights,
  inventoryInitial,
  isAdminBlock,
} from "@/hooks/useFlightBlockings";

// Componentes hijos
import ReservationTable from "./ReservationTable";
import BlockEditor from "./BlockEditor";
import InventoryEditor from "./InventoryEditor";
import LinkEditor from "./LinkEditor";
import SplitEditor from "./SplitEditor";
import ManualReservationEditor from "./ManualReservationEditor";
import AdminDashboard from "./AdminDashboard";

export function FlightBlockingsDashboard({
  control = false,
}: {
  control?: boolean;
}) {
  const h = useFlightBlockings({ control });

  // Estado para el modal de eliminar
  const [blockToDelete, setBlockToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteBlock = async () => {
    if (!blockToDelete) return;
    setIsDeleting(true);
    try {
      const success = await h.post(
        {
          action: "deleteBlock",
          blockId: blockToDelete.id,
          revision: blockToDelete.revision,
        },
        "Bloqueo eliminado del tablero.",
      );

      if (success) {
        toast.success("Bloqueo eliminado correctamente");
        setBlockToDelete(null); // Cierra el modal si tuvo éxito
      } else {
        // El hook guarda el error del backend en h.error
        toast.error(
          h.error ||
            "No se pudo eliminar. El bloqueo tiene reservas activas vinculadas.",
        );
      }
    } catch (error: any) {
      toast.error(error.message || "Error de conexión al intentar eliminar.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (control) {
    return (
      <div className="w-full max-w-7xl mx-auto">
        <AdminDashboard
          services={h.visibleServices || []}
          alerts={h.board?.alerts || []}
          events={h.board?.events || []}
          blocks={h.board?.blocks || []}
          files={h.board?.files || []}
          canEdit={true} // Forzado a true para que no oculte acciones
          canAdmin={true} // Forzado a true para que no muestre "Restringido"
          today={h.board?.today || ""}
          activeTab={h.tab as any}
          onTabChange={(tab) => h.openSection(tab as any)}
          filters={h.filters}
          onFiltersChange={h.patchFilters}
          onLink={(s: any) => h.openServiceEditor("link", s)}
          onSplit={(s: any) => h.openServiceEditor("split", s)}
          onReview={(s: any) => h.reviewReservation(s)}
          onUpload={(file, blockId, kind) => h.upload(file, blockId, kind)}
          onCompleteTask={(b, kind, reopen, prevPay, prevData) =>
            h.completeTask(b, kind, reopen, prevPay, prevData)
          }
        />

        {/* Modales de administración */}
        {h.editor.kind === "link" && (
          <LinkEditor
            open={true}
            service={(h.editor as any).service}
            blocks={h.blocks}
            draft={(h.editor as any).draft}
            onChange={h.updateLinkDraft}
            onSave={(blockId, seats) =>
              h.linkReservation((h.editor as any).service, blockId, seats)
            }
            onCancel={h.closeEditor}
            busy={h.busy}
            error={h.error}
          />
        )}
        {h.editor.kind === "split" && (
          <SplitEditor
            open={true}
            service={(h.editor as any).service}
            rows={(h.editor as any).rows}
            onRowsChange={h.updateSplitRows}
            onSave={(rows) =>
              h.splitReservation((h.editor as any).service, rows)
            }
            onCancel={h.closeEditor}
            busy={h.busy}
          />
        )}
      </div>
    );
  }

  // VISTA DE INVENTARIO (Tarjetas)
  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Plane className="h-6 w-6" /> Bloqueos JetSMART
          </h1>
          <p className="text-muted-foreground mt-1">
            Consulta disponibilidad de vuelos y cupos.
          </p>
        </div>
      </div>

      {h.error && (
        <div className="flex flex-col gap-3 p-4 border border-destructive/30 bg-destructive/5 rounded-lg">
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            <span className="font-medium">No se pudieron cargar los datos</span>
          </div>
          <p className="text-sm text-muted-foreground">{h.error}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => h.load()}
            className="w-fit"
          >
            <RotateCcw className="h-4 w-4 mr-2" /> Reintentar
          </Button>
        </div>
      )}

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
              {h.destinations.map((d: any) => (
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
              {h.nightOptions.map((n: any) => (
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
                      <span className="font-medium">
                        {" "}
                        {b.departDate} <br /> {b.departTime}
                      </span>
                    </div>
                    <div className="flex flex-col text-right">
                      <span className="text-xs text-muted-foreground uppercase">
                        Regreso
                      </span>
                      <span className="font-medium">
                        {" "}
                        {b.returnDate} <br /> {b.returnTime}
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

                  {/* Botones principales */}
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

                  {/* Acordeón de detalles */}
                  <details className="mt-2 text-xs border-t pt-2 group">
                    <summary className="cursor-pointer text-muted-foreground font-medium flex items-center gap-1 hover:text-foreground">
                      <span className="group-open:rotate-90 transition-transform text-[10px]">
                        ▶
                      </span>{" "}
                      Detalles y opciones
                    </summary>
                    <div className="mt-2 space-y-1 pl-3 text-muted-foreground">
                      <p>
                        {b.title} ·{" "}
                        {b.drive ? "Origen: Drive" : "Registro manual"}
                      </p>
                      <p>
                        {b.origin || "Origen pendiente"} →{" "}
                        {b.destination || "Destino pendiente"}{" "}
                        {b.flight && `· ${b.flight}`}
                      </p>
                      {h.canAdmin && (
                        <p>
                          Pago: {b.paymentDue || "Pendiente"} · Datos:{" "}
                          {b.namesDue || "Pendiente"}
                        </p>
                      )}
                      {b.notes && <p className="italic">{b.notes}</p>}

                      {h.canEdit && (
                        <div className="flex gap-2 pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => h.openBlockEditor(b)}
                          >
                            Editar bloqueo
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => setBlockToDelete(b)}
                          >
                            Eliminar bloqueo
                          </Button>
                        </div>
                      )}
                    </div>
                  </details>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {h.blocks.length === 0 && (
          <div className="text-center py-16 bg-muted/20 border border-dashed rounded-lg">
            <Plane className="mx-auto h-10 w-10 text-muted-foreground mb-3 opacity-50" />
            <h3 className="text-lg font-medium">
              No hay bloqueos para estos filtros
            </h3>
            <p className="text-sm text-muted-foreground">
              Prueba cambiando el destino o las fechas.
            </p>
          </div>
        )}
      </div>

      {/* MODAL DE ELIMINAR (Shadcn) */}
      <Dialog
        open={!!blockToDelete}
        onOpenChange={(open) => !open && setBlockToDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar este bloqueo?</DialogTitle>
            <DialogDescription>
              Esta acción no se puede deshacer. Las reservas y el historial se
              conservarán.
            </DialogDescription>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Estás a punto de eliminar el bloqueo{" "}
            <strong>{blockToDelete?.code}</strong>. Si tiene reservas activas,
            primero debes vincularlas al bloqueo correcto.
          </p>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setBlockToDelete(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteBlock}
              disabled={isDeleting}
            >
              {isDeleting ? "Eliminando..." : "Eliminar bloqueo"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* MODALES DE INVENTARIO */}
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
