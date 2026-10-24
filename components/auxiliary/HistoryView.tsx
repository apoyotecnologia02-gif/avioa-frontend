"use client";

import { useMemo, useState } from "react";
import {
  Search,
  Download,
  Pencil,
  Archive,
  RotateCcw,
  Bus,
  Plus,
  FolderOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type {
  AuxiliaryRecord,
  AuxiliaryPermissions,
  AuxiliaryPayload,
} from "@/types/auxiliary";
import { kindLabels } from "./Workspace";
import {
  auxiliaryPdfUrl,
  downloadAuxiliaryPdf,
} from "@/lib/auxiliary/auxiliar-repository";
import { voucherFromTransferRequest } from "@/lib/auxiliary/domain/transfer-request-voucher";
import type { TransferRequestData } from "@/lib/auxiliary/domain/transfer-requests";

const statusLabels = {
  ready: "Revisado",
  pending: "Pendiente de envío",
  manual: "Envío manual registrado",
  confirmed: "Confirmado · registro manual",
};

interface Props {
  rows: AuxiliaryRecord[];
  loading: boolean;
  permissions: AuxiliaryPermissions;
  onOpen: (row: AuxiliaryRecord) => void;
  onArchive: (row: AuxiliaryRecord) => void;
  onSeedTransfer: (payload: AuxiliaryPayload) => void;
  onNew: () => void;
  notify: (s: string) => void;
}

export function HistoryView({
  rows,
  permissions,
  onOpen,
  onArchive,
  onSeedTransfer,
  onNew,
  notify,
}: Props) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("");
  const [archived, setArchived] = useState(false);

  const active = rows.filter((r) => !r.archivedAt);
  const filtered = useMemo(
    () =>
      rows.filter(
        (r) =>
          !!r.archivedAt === archived &&
          (!filter || r.kind === filter) &&
          (r.reference + " " + kindLabels[r.kind])
            .toLocaleLowerCase()
            .includes(query.toLocaleLowerCase()),
      ),
    [rows, archived, filter, query],
  );

  const transferRequests = filtered.filter(
    (r) => r.kind === "request" && !r.archivedAt,
  );

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[200px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            aria-label="Buscar documento"
            placeholder="Buscar número de reserva o tipo de documento…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={filter || "all"}
          onValueChange={(v) => setFilter(v === "all" ? "" : v)}
        >
          <SelectTrigger className="w-56">
            <SelectValue placeholder="Todos los documentos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los documentos</SelectItem>
            {Object.entries(kindLabels).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tabs activos/archivados */}
      <div className="flex gap-2">
        <Button
          variant={!archived ? "default" : "outline"}
          size="sm"
          onClick={() => setArchived(false)}
        >
          Activos · {active.length}
        </Button>
        <Button
          variant={archived ? "default" : "outline"}
          size="sm"
          onClick={() => setArchived(true)}
        >
          Archivados · {rows.length - active.length}
        </Button>
      </div>

      {/* Tabla */}
      {filtered.length > 0 ? (
        <>
          <div className="overflow-hidden rounded-lg border border-border bg-card">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/40">
                  <tr className="text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    <th className="px-4 py-3">Reserva / Referencia</th>
                    <th className="px-4 py-3">Documento</th>
                    <th className="px-4 py-3">Estado</th>
                    <th className="px-4 py-3">Actualización</th>
                    <th className="px-4 py-3">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((row) => (
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
                          variant={
                            row.state === "pending" ? "outline" : "secondary"
                          }
                          className={cn(
                            row.state === "pending" &&
                              "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300",
                          )}
                        >
                          {row.archivedAt
                            ? "Archivado"
                            : statusLabels[row.state]}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {new Date(row.updatedAt).toLocaleString("es-CO", {
                          timeZone: "America/Bogota",
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
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
                                title={
                                  !row.auxiliaryRecordId
                                    ? "Documento sin ID — revisa el backend"
                                    : "Descargar PDF"
                                }
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

          {!archived && (
            <Card className="bg-muted/40 p-4 text-xs leading-relaxed text-muted-foreground">
              <strong className="block text-sm text-foreground">
                De solicitud a voucher
              </strong>
              Abre una solicitud guardada y usa "Preparar voucher" para
              reutilizar sus datos. Los estados de envío y confirmación se
              registran manualmente.
            </Card>
          )}

          {transferRequests.length > 0 && (
            <div className="space-y-2">
              {transferRequests.map((r) => (
                <div
                  key={r.auxiliaryRecordId}
                  className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card px-4 py-2.5"
                >
                  <span className="text-xs text-muted-foreground">
                    {r.reference}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!permissions.canCreate}
                    onClick={() => {
                      try {
                        const payload = voucherFromTransferRequest(
                          r.payload as TransferRequestData,
                          r.auxiliaryRecordId,
                        );
                        onSeedTransfer(payload);
                      } catch (e) {
                        notify((e as Error).message);
                      }
                    }}
                    className="gap-1.5"
                  >
                    <Bus className="h-3.5 w-3.5" /> Preparar voucher
                  </Button>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <Card className="flex flex-col items-center gap-3 border-dashed p-10 text-center">
          <FolderOpen className="h-8 w-8 text-muted-foreground/60" />
          <div>
            <p className="text-sm font-medium">
              {query
                ? "No hay coincidencias"
                : "Todavía no hay documentos en esta vista"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Crea un documento o cambia los filtros para consultar tu
              historial.
            </p>
          </div>
          <Button variant="outline" onClick={onNew} className="gap-1.5">
            <Plus className="h-4 w-4" /> Preparar documento
          </Button>
        </Card>
      )}
    </div>
  );
}
