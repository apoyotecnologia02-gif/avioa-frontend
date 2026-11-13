'use client';

import { AlertTriangle, Save, UserPlus, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { Block, ManualReservationDraft, ManualReservationInput } from '@/types/block.types';

export interface ManualReservationEditorProps {
  open: boolean;
  blocks: readonly Block[];
  initialBlockId?: string;
  draft: ManualReservationDraft;
  onChange: (patch: Partial<Omit<ManualReservationDraft, 'requestId'>>) => void;
  onSave: (data: ManualReservationInput) => void | Promise<unknown>;
  onCancel: () => void;
  busy?: boolean;
  error?: string;
  idPrefix?: string;
}

export default function ManualReservationEditor({ open, blocks, initialBlockId = '', draft, onChange,
  onSave, onCancel, busy = false, error, idPrefix = 'manual-reservation-editor' }: ManualReservationEditorProps) {
  // null significa usar la selección inicial; '' conserva una selección vacía.
  const blockId = draft.blockId ?? initialBlockId;
  const selectedBlock = blocks.find(block => block.id === blockId);
  const available = selectedBlock?.available ?? null;
  const seats = draft.seatsText.trim() ? Number(draft.seatsText) : NaN;
  const validSeats = Number.isSafeInteger(seats) && seats >= 1 && seats <= 500;
  const tooMany = validSeats && available !== null && seats > available;
  const reference = draft.reference.trim().toUpperCase();
  const referenceValid = !reference || /^[A-Z0-9][A-Z0-9 _./-]{0,99}$/.test(reference);
  const canSave = !!selectedBlock && !selectedBlock.deletedAt && available !== null && validSeats &&
    seats <= available && !!draft.passenger.trim() && draft.passenger.length <= 150 &&
    draft.advisor.length <= 150 && referenceValid && !!draft.requestId;

  return (
    <Dialog open={open} onOpenChange={next => { if (!next && !busy) onCancel(); }}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-xl"
        onEscapeKeyDown={event => { if (busy) event.preventDefault(); }}
        onInteractOutside={event => { if (busy) event.preventDefault(); }}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><UserPlus className="size-5" aria-hidden="true" />Crear reserva manual</DialogTitle>
          <DialogDescription>Registra una reserva y descuenta sus pasajeros del bloqueo seleccionado.</DialogDescription>
        </DialogHeader>
        <form className="space-y-5" aria-busy={busy} onSubmit={event => {
          event.preventDefault();
          if (!busy && canSave) void onSave({ requestId: draft.requestId, blockId,
            reference, passenger: draft.passenger.trim(), advisor: draft.advisor.trim(), seats });
        }}>
          <fieldset disabled={busy} className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
            <legend className="sr-only">Datos de la reserva manual</legend>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor={`${idPrefix}-block`}>Bloqueo</Label>
              <Select value={blockId} required disabled={busy} onValueChange={value => onChange({ blockId: value })}>
                <SelectTrigger id={`${idPrefix}-block`} className="w-full"><SelectValue placeholder="Selecciona un bloqueo" /></SelectTrigger>
                <SelectContent>{blocks.map(block => (
                  <SelectItem key={block.id} value={block.id} disabled={!!block.deletedAt}>
                    {block.code} · {block.title} · {block.departDate} · {block.available === null ? 'Por revisar' : `${block.available} cupos`}
                  </SelectItem>
                ))}</SelectContent>
              </Select>
              {!blocks.length && <p className="text-sm text-muted-foreground">No hay bloqueos para registrar reservas.</p>}
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor={`${idPrefix}-reference`}>Código de reserva / AVI (opcional)</Label>
              <Input id={`${idPrefix}-reference`} maxLength={100} value={draft.reference}
                onChange={event => onChange({ reference: event.target.value })} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor={`${idPrefix}-passenger`}>Pasajero titular</Label>
              <Input id={`${idPrefix}-passenger`} required maxLength={150} value={draft.passenger}
                onChange={event => onChange({ passenger: event.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${idPrefix}-advisor`}>Asesor</Label>
              <Input id={`${idPrefix}-advisor`} maxLength={150} value={draft.advisor}
                onChange={event => onChange({ advisor: event.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${idPrefix}-seats`}>Cupos / pasajeros con asiento</Label>
              <Input id={`${idPrefix}-seats`} type="number" inputMode="numeric" required min={1} max={Math.max(1, Math.min(500, available ?? 500))}
                step={1} value={draft.seatsText} onChange={event => onChange({ seatsText: event.target.value })} />
            </div>
          </fieldset>
          <div role="status" aria-live="polite" aria-atomic="true" className="space-y-2 rounded-xl border bg-muted/50 p-4">
            <p className="flex flex-wrap items-center justify-between gap-2 text-sm">Cupos disponibles
              <Badge variant={available !== null && available <= 0 ? 'destructive' : 'secondary'}>
                {!selectedBlock ? 'Selecciona un bloqueo' : available === null ? 'Por revisar' : `${available} cupos`}
              </Badge>
            </p>
            {selectedBlock && available === null && <p className="text-sm text-destructive">Confirma el inventario pendiente antes de registrar la reserva.</p>}
            {selectedBlock && available !== null && available <= 0 && <p className="text-sm text-destructive">Este bloqueo no tiene cupos disponibles.</p>}
            {tooMany && <p className="flex items-start gap-2 text-sm text-destructive">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />Solicitas {seats} cupos y solo hay {available} disponibles.</p>}
            {selectedBlock && validSeats && available !== null && !tooMany && <p className="text-sm text-muted-foreground">Después de guardar quedarían {available - seats} cupos. El servidor reconfirma el saldo al guardar.</p>}
            {!!blockId && !selectedBlock && <p className="text-sm text-destructive">El bloqueo seleccionado ya no está disponible. Selecciona otro.</p>}
            {!referenceValid && <p className="text-sm text-destructive">Revisa el código: usa letras, números, espacios o los signos _ . / -.</p>}
          </div>
          <p className="text-xs text-muted-foreground">Si la reserva ya existe en Travel Compositor, utiliza el registro sincronizado para evitar descontar sus cupos dos veces.</p>
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" disabled={busy} onClick={onCancel}><X className="size-4" aria-hidden="true" />Cancelar</Button>
            <Button type="submit" disabled={busy || !canSave}><Save className="size-4" aria-hidden="true" />{busy ? 'Guardando…' : 'Guardar reserva'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
