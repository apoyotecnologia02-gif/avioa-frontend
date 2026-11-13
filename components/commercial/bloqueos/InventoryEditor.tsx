'use client';

import { AlertTriangle, Save, Users, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { AdminBlock, InventoryDraft } from '@/types/block.types';

export interface InventoryEditorProps {
  open: boolean;
  data: AdminBlock;
  draft: InventoryDraft;
  onChange: (patch: Partial<InventoryDraft>) => void;
  onSave: () => void | Promise<unknown>;
  onCancel: () => void;
  busy?: boolean;
  error?: string;
  idPrefix?: string;
}

export default function InventoryEditor({ open, data, draft, onChange, onSave, onCancel,
  busy = false, error, idPrefix = 'inventory-editor' }: InventoryEditorProps) {
  // Valores derivados únicamente de props; no hay estado ni efectos locales.
  const totalMode = draft.mode === 'total';
  const quantity = draft.quantityText.trim() ? Number(draft.quantityText) : NaN;
  const validQuantity = Number.isSafeInteger(quantity) && quantity >= (totalMode ? 1 : 0) && quantity <= 10000;
  const sales = totalMode ? data.sold : data.netSold;
  const available = validQuantity ? quantity - sales : null;
  const unresolved = totalMode ? data.unresolved : data.inventoryUnresolved;
  const validReason = draft.reason.trim().length >= 5 && draft.reason.length <= 1000;
  const editable = !!data.drive;

  return (
    <Dialog open={open} onOpenChange={next => { if (!next && !busy) onCancel(); }}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-xl"
        onEscapeKeyDown={event => { if (busy) event.preventDefault(); }}
        onInteractOutside={event => { if (busy) event.preventDefault(); }}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Users className="size-5" aria-hidden="true" />Ajustar cupos · {data.code}</DialogTitle>
          <DialogDescription>Elige cómo controlar el inventario e indica el motivo del ajuste.</DialogDescription>
        </DialogHeader>
        <form className="space-y-5" aria-busy={busy}
          onSubmit={event => { event.preventDefault(); if (!busy && editable && validQuantity && validReason) void onSave(); }}>
          <fieldset disabled={busy || !editable} className="min-w-0 space-y-4">
            <legend className="sr-only">Ajuste de inventario</legend>
            <div className="space-y-2">
              <Label htmlFor={`${idPrefix}-mode`}>Modo de inventario</Label>
              <Select value={draft.mode} disabled={busy || !editable} onValueChange={value => {
                if (value === 'remaining' || value === 'total') onChange({ mode: value });
              }}>
                <SelectTrigger id={`${idPrefix}-mode`} className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="remaining">Remanente al iniciar el control</SelectItem>
                  <SelectItem value="total">Total contratado</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">{totalMode
                ? 'Descuenta todas las ventas vinculadas, incluidas las anteriores a la integración.'
                : 'Descuenta el movimiento neto posterior al saldo inicial. Las cancelaciones pueden devolver cupos.'}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${idPrefix}-quantity`}>{totalMode ? 'Cupo total contratado' : 'Saldo remanente inicial'}</Label>
              <Input id={`${idPrefix}-quantity`} name="quantity" type="number" inputMode="numeric"
                required min={totalMode ? 1 : 0} max={10000} step={1} value={draft.quantityText}
                onChange={event => onChange({ quantityText: event.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${idPrefix}-reason`}>Motivo del ajuste</Label>
              <Textarea id={`${idPrefix}-reason`} name="reason" required minLength={5} maxLength={1000}
                rows={4} value={draft.reason} placeholder="Ejemplo: conciliación de las ventas anteriores al portal."
                onChange={event => onChange({ reason: event.target.value })} />
            </div>
          </fieldset>

          <div role="status" aria-live="polite" aria-atomic="true" className="space-y-3 rounded-xl border bg-muted/50 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium">{unresolved > 0 ? 'Disponible provisional' : 'Disponible proyectado'}</p>
              <Badge variant={available !== null && available < 0 ? 'destructive' : 'secondary'}>
                {available === null ? 'Cantidad no válida' : `${available} cupos`}
              </Badge>
            </div>
            {available !== null && <p className="text-sm text-muted-foreground">
              {quantity} {totalMode ? 'contratados' : 'de saldo inicial'} − ({sales} {totalMode ? 'vendidos' : 'de movimiento neto'}) = {available} cupos
            </p>}
            {available !== null && available < 0 && <p className="flex items-start gap-2 text-sm text-destructive">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />Las ventas superan el cupo indicado. El ajuste refleja sobreventa.
            </p>}
            {unresolved > 0 && <p className="flex items-start gap-2 text-sm text-amber-700 dark:text-amber-400">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              Hay {unresolved} pendientes de revisión. Esta proyección no confirma el disponible final.
            </p>}
            {!editable && <p className="text-sm text-destructive">Este ajuste requiere un bloqueo con inventario de Drive.</p>}
          </div>
          <p className="text-xs text-muted-foreground">El ajuste queda en el historial, reabre las gestiones de pago y datos y no modifica la hoja de Drive.</p>
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" disabled={busy} onClick={onCancel}>
              <X className="size-4" aria-hidden="true" />Cancelar
            </Button>
            <Button type="submit" disabled={busy || !editable || !validQuantity || !validReason}>
              <Save className="size-4" aria-hidden="true" />{busy ? 'Guardando…' : 'Guardar ajuste'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
