"use client";

import { AlertTriangle, Plus, Save, Split, Trash2, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { PassengerSplit, Service } from "@/types/block.types";

export interface SplitEditorProps {
  open: boolean;
  service: Service;
  rows: readonly PassengerSplit[];
  onRowsChange: (rows: PassengerSplit[]) => void;
  onSave: (rows: PassengerSplit[]) => void | Promise<unknown>;
  onCancel: () => void;
  busy?: boolean;
  error?: string;
  idPrefix?: string;
}

export default function SplitEditor({
  open,
  service,
  rows,
  onRowsChange,
  onSave,
  onCancel,
  busy = false,
  error,
  idPrefix = "split-editor",
}: SplitEditorProps) {
  const totalKnown =
    service.seats !== null &&
    Number.isSafeInteger(service.seats) &&
    service.seats > 0;
  const countsValid = rows.every(
    (row) =>
      Number.isSafeInteger(row.passengers) &&
      row.passengers >= 1 &&
      row.passengers <= 500,
  );
  const assigned = rows.reduce(
    (total, row) =>
      total + (Number.isFinite(row.passengers) ? row.passengers : 0),
    0,
  );
  const remaining =
    totalKnown && service.seats !== null ? service.seats - assigned : null;
  const codes = rows.map((row) => row.code.trim().toUpperCase());
  const duplicateCodes =
    new Set(codes.filter(Boolean)).size !== codes.filter(Boolean).length;
  const codesValid = codes.every((code) =>
    /^[A-Z0-9][A-Z0-9 _./-]{0,99}$/.test(code),
  );
  const notesValid = rows.every((row) => row.note.length <= 300);
  const inactive =
    service.cancelled || !!service.deletedAt || !service.splitReady;
  const canSave =
    !inactive &&
    totalKnown &&
    countsValid &&
    codesValid &&
    !duplicateCodes &&
    notesValid &&
    rows.length <= 100 &&
    remaining !== null &&
    remaining >= 0;
  const updateRow = (index: number, patch: Partial<PassengerSplit>): void => {
    onRowsChange(
      rows.map((row, position) =>
        position === index ? { ...row, ...patch } : row,
      ),
    );
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next && !busy) onCancel();
      }}
    >
      <DialogContent
        className="max-h-[90dvh] overflow-y-auto sm:max-w-3xl"
        onEscapeKeyDown={(event) => {
          if (busy) event.preventDefault();
        }}
        onInteractOutside={(event) => {
          if (busy) event.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Split className="size-5" aria-hidden="true" />
            Dividir pasajeros · {service.avi}
          </DialogTitle>
          <DialogDescription>
            Distribuye los pasajeros entre códigos. Las divisiones no generan
            ventas ni descuentan cupos adicionales.
          </DialogDescription>
        </DialogHeader>
        <form
          className="space-y-5"
          aria-busy={busy}
          onSubmit={(event) => {
            event.preventDefault();
            if (!busy && canSave)
              void onSave(
                rows.map((row) => ({
                  ...row,
                  code: row.code.trim().toUpperCase(),
                  note: row.note.trim(),
                })),
              );
          }}
        >
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3">
            <p className="break-words text-sm">
              Reserva madre: <strong>{service.avi}</strong>
            </p>
            <Badge variant="secondary">
              {totalKnown
                ? `${service.seats} pasajeros`
                : "Total por confirmar"}
            </Badge>
          </div>
          {service.splitStale && (
            <p className="flex items-start gap-2 text-sm text-amber-700 dark:text-amber-400">
              <AlertTriangle
                className="mt-0.5 size-4 shrink-0"
                aria-hidden="true"
              />
              La reserva madre cambió. Revisa y confirma la distribución actual.
            </p>
          )}
          <fieldset disabled={busy || inactive} className="min-w-0 space-y-4">
            <legend className="sr-only">Códigos y pasajeros</legend>
            {rows.map((row, index) => (
              <div
                key={index}
                className="grid min-w-0 grid-cols-1 gap-3 rounded-xl border p-4 sm:grid-cols-2"
              >
                <div className="space-y-2">
                  <Label htmlFor={`${idPrefix}-code-${index}`}>
                    Código de reserva {index + 1}
                  </Label>
                  <Input
                    id={`${idPrefix}-code-${index}`}
                    required
                    maxLength={100}
                    value={row.code}
                    onChange={(event) =>
                      updateRow(index, { code: event.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`${idPrefix}-passengers-${index}`}>
                    Pasajeros con asiento
                  </Label>
                  <Input
                    id={`${idPrefix}-passengers-${index}`}
                    type="number"
                    inputMode="numeric"
                    required
                    min={1}
                    max={500}
                    step={1}
                    value={
                      Number.isFinite(row.passengers) && row.passengers !== 0
                        ? row.passengers
                        : ""
                    }
                    onChange={(event) =>
                      updateRow(index, {
                        passengers:
                          event.target.value === ""
                            ? 0
                            : event.target.valueAsNumber,
                      })
                    }
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor={`${idPrefix}-note-${index}`}>
                    Nota / pasajeros (opcional)
                  </Label>
                  <Textarea
                    id={`${idPrefix}-note-${index}`}
                    rows={2}
                    maxLength={300}
                    value={row.note}
                    onChange={(event) =>
                      updateRow(index, { note: event.target.value })
                    }
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="justify-self-start text-destructive sm:col-span-2"
                  onClick={() =>
                    onRowsChange(
                      rows.filter((_, position) => position !== index),
                    )
                  }
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                  Quitar código {index + 1}
                </Button>
              </div>
            ))}
            {!rows.length && (
              <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                Sin divisiones. Al guardar, todos los pasajeros quedan en la
                reserva madre.
              </p>
            )}
            <Button
              type="button"
              variant="outline"
              disabled={busy || inactive || rows.length >= 100}
              onClick={() =>
                onRowsChange([...rows, { code: "", passengers: 1, note: "" }])
              }
            >
              <Plus className="size-4" aria-hidden="true" />
              Agregar código
            </Button>
          </fieldset>
          <div
            role="status"
            aria-live="polite"
            aria-atomic="true"
            className="space-y-2 rounded-xl border bg-muted/50 p-4"
          >
            <p className="text-sm">
              <strong>{assigned}</strong> pasajeros asignados ·{" "}
              <strong>{remaining ?? "Por confirmar"}</strong> pendientes en la
              reserva madre
            </p>
            {remaining !== null && remaining < 0 && (
              <p className="flex items-start gap-2 text-sm text-destructive">
                <AlertTriangle
                  className="mt-0.5 size-4 shrink-0"
                  aria-hidden="true"
                />
                Hay {Math.abs(remaining)} pasajeros de más. Reduce la
                distribución para guardar.
              </p>
            )}
            {!totalKnown && (
              <p className="text-sm text-destructive">
                Confirma el total de pasajeros de la reserva madre antes de
                dividir.
              </p>
            )}
            {!countsValid && (
              <p className="text-sm text-destructive">
                Cada fila debe tener de 1 a 500 pasajeros enteros.
              </p>
            )}
            {duplicateCodes && (
              <p className="text-sm text-destructive">
                Los códigos de reserva no pueden repetirse.
              </p>
            )}
            {!codesValid && (
              <p className="text-sm text-destructive">
                Completa cada código con letras, números, espacios o los signos
                _ . / -.
              </p>
            )}
            {inactive && (
              <p className="text-sm text-destructive">
                Vincula y confirma los cupos de una reserva activa antes de
                dividirla.
              </p>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Quitar una fila devuelve sus pasajeros a la reserva madre; no libera
            cupos del bloqueo. Guarda sin filas para deshacer la división.
          </p>
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={busy}
              onClick={onCancel}
            >
              <X className="size-4" aria-hidden="true" />
              Cancelar
            </Button>
            <Button type="submit" disabled={busy || !canSave}>
              <Save className="size-4" aria-hidden="true" />
              {busy ? "Guardando…" : "Guardar distribución"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
